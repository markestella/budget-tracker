import { prisma } from '@/lib/prisma';
import { PaymentCalculator } from '@/lib/paymentCalculator';

interface IncomeSource {
  id: string;
  userId: string;
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  scheduleDays?: number[] | null;
  scheduleWeekday?: number | null;
  scheduleWeek?: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'LAST' | null;
  scheduleTime?: string | null;
  amount: number;
  isActive: boolean;
  useManualAmounts?: boolean | null;
  scheduleDayAmounts?: Record<number, number> | null;
}

export class PaymentRecordGenerator {
  /**
   * Auto-generate payment records for all active income sources
   * This should be called periodically (e.g., daily via cron job)
   */
  static async generateUpcomingPaymentRecords(userId?: string, daysAhead: number = 90): Promise<{
    created: number;
    errors: string[];
  }> {
    const result = {
      created: 0,
      errors: [] as string[]
    };

    try {
      // First clean up any invalid records
      await this.cleanupInvalidRecords();

      // Get active income sources
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {
        isActive: true,
        frequency: { not: 'ONE_TIME' }
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const incomeSources = await prisma.incomeSource.findMany({
        where: whereClause
      });

      const currentDate = new Date();
      const endDate = new Date(currentDate);
      endDate.setDate(endDate.getDate() + daysAhead);

      for (const source of incomeSources) {
        try {
          // Convert Prisma result to IncomeSource interface
          const convertedSource: IncomeSource = {
            ...source,
            amount: parseFloat(source.amount.toString()),
            scheduleDayAmounts: source.scheduleDayAmounts ? 
              (typeof source.scheduleDayAmounts === 'object' ? source.scheduleDayAmounts as Record<number, number> : {}) 
              : {}
          };
          await this.generateRecordsForSource(convertedSource, currentDate, endDate);
          result.created++;
        } catch (error) {
          result.errors.push(`Failed to generate records for source ${source.id}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`General error in generateUpcomingPaymentRecords: ${error}`);
      return result;
    }
  }

  /**
   * Generate payment records for a specific income source
   */
  static async generateRecordsForSource(
    source: IncomeSource, 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    if (!source.isActive || source.frequency === 'ONE_TIME') {
      return 0;
    }

    try {
      // Get upcoming payment dates using the calculator
      const upcomingPayments = PaymentCalculator.getUpcomingPayments(
        {
          frequency: source.frequency,
          scheduleDays: source.scheduleDays || undefined,
          scheduleWeekday: source.scheduleWeekday || undefined,
          scheduleWeek: source.scheduleWeek || undefined,
          scheduleTime: source.scheduleTime || undefined,
          amount: source.amount,
          useManualAmounts: source.useManualAmounts || false,
          scheduleDayAmounts: source.scheduleDayAmounts || {}
        },
        startDate,
        Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      let createdCount = 0;

      for (const payment of upcomingPayments) {
        // Validate payment amount before creating record
        if (!payment.amount || isNaN(payment.amount) || payment.amount <= 0) {
          continue; // Skip invalid payments
        }

        // Check if a record already exists for this date
        const existingRecord = await prisma.incomeRecord.findFirst({
          where: {
            incomeSourceId: source.id,
            expectedDate: {
              gte: new Date(payment.date.toDateString()), // Start of day
              lt: new Date(payment.date.getTime() + 24 * 60 * 60 * 1000) // End of day
            }
          }
        });

        // Only create if no record exists
        if (!existingRecord) {
          await prisma.incomeRecord.create({
            data: {
              userId: source.userId,
              incomeSourceId: source.id,
              expectedDate: payment.date,
              status: 'PENDING',
              notes: `Auto-generated: Expected ${payment.amount.toFixed(2)}`
            }
          });
          createdCount++;
        }
      }

      return createdCount;
    } catch (error) {
      throw new Error(`Failed to generate records for source ${source.id}: ${error}`);
    }
  }

  /**
   * Generate payment records for a specific user
   */
  static async generatePaymentRecordsForUser(userId: string, daysAhead: number = 90): Promise<{
    created: number;
    errors: string[];
  }> {
    return this.generateUpcomingPaymentRecords(userId, daysAhead);
  }

  /**
   * Clean up old pending records that are overdue by a significant margin
   * This helps prevent accumulation of stale pending records
   */
  static async cleanupOverdueRecords(daysPastDue: number = 30): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const result = {
      deleted: 0,
      errors: [] as string[]
    };

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysPastDue);

      const deletedRecords = await prisma.incomeRecord.deleteMany({
        where: {
          status: 'PENDING',
          expectedDate: {
            lt: cutoffDate
          },
          notes: 'Auto-generated based on schedule configuration' // Only delete auto-generated records
        }
      });

      result.deleted = deletedRecords.count;
      return result;
    } catch (error) {
      result.errors.push(`Error cleaning up overdue records: ${error}`);
      return result;
    }
  }

  /**
   * Clean up invalid records with corrupted data
   */
  static async cleanupInvalidRecords(): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const result = {
      deleted: 0,
      errors: [] as string[]
    };

    try {
      // Delete auto-generated pending records that might have become corrupted
      // We'll be conservative and only delete auto-generated ones to avoid data loss
      const deletedRecords = await prisma.incomeRecord.deleteMany({
        where: {
          notes: 'Auto-generated based on schedule configuration',
          status: 'PENDING',
        }
      });

      result.deleted = deletedRecords.count;
      return result;
    } catch (error) {
      result.errors.push(`Error cleaning up invalid records: ${error}`);
      return result;
    }
  }

  /**
   * Update next payment dates for all active income sources
   */
  static async updateNextPaymentDates(): Promise<{
    updated: number;
    errors: string[];
  }> {
    const result = {
      updated: 0,
      errors: [] as string[]
    };

    try {
      const incomeSources = await prisma.incomeSource.findMany({
        where: {
          isActive: true,
          frequency: { not: 'ONE_TIME' }
        }
      });

      const currentDate = new Date();

      for (const source of incomeSources) {
        try {
          const nextPaymentDate = PaymentCalculator.getNextPaymentDate(
            {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              frequency: source.frequency as any,
              scheduleDays: source.scheduleDays || undefined,
              scheduleWeekday: source.scheduleWeekday || undefined,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              scheduleWeek: source.scheduleWeek as any || undefined,
              scheduleTime: source.scheduleTime || undefined,
              amount: parseFloat(source.amount.toString()),
              useManualAmounts: source.useManualAmounts || false,
              scheduleDayAmounts: source.scheduleDayAmounts ? 
                (typeof source.scheduleDayAmounts === 'object' ? source.scheduleDayAmounts as Record<number, number> : {}) 
                : {}
            },
            currentDate
          );

          if (nextPaymentDate) {
            await prisma.incomeSource.update({
              where: { id: source.id },
              data: { nextPaymentDate }
            });
            result.updated++;
          }
        } catch (error) {
          result.errors.push(`Failed to update next payment date for source ${source.id}: ${error}`);
        }
      }

      return result;
    } catch (error) {
      result.errors.push(`General error in updateNextPaymentDates: ${error}`);
      return result;
    }
  }
}