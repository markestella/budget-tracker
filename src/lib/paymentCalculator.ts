interface IncomeSource {
  frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  scheduleDays?: number[];
  scheduleWeekday?: number;
  scheduleWeek?: 'FIRST' | 'SECOND' | 'THIRD' | 'FOURTH' | 'LAST';
  scheduleTime?: string;
  amount: number;
  useManualAmounts?: boolean;
  scheduleDayAmounts?: Record<number, number>;
}

interface PaymentDate {
  date: Date;
  amount: number;
}

export class PaymentCalculator {
  /**
   * Calculate the per-payment amount based on frequency and schedule
   */
  static calculatePerPaymentAmount(source: IncomeSource, specificDay?: number): number {
    // Validate source amount
    if (!source.amount || isNaN(source.amount) || source.amount <= 0) {
      return 0;
    }

    // For monthly frequency with manual amounts
    if (source.frequency === 'MONTHLY' && source.useManualAmounts && source.scheduleDayAmounts && specificDay) {
      const dayAmounts = source.scheduleDayAmounts as Record<string, unknown>;
      const manualAmount = dayAmounts[specificDay] || dayAmounts[specificDay.toString()] || 0;
      return isNaN(Number(manualAmount)) ? 0 : Number(manualAmount);
    }
    
    // For monthly frequency with multiple scheduled days (automatic division)
    if (source.frequency === 'MONTHLY' && source.scheduleDays && source.scheduleDays.length > 1) {
      const dividedAmount = source.amount / source.scheduleDays.length;
      return isNaN(dividedAmount) ? 0 : dividedAmount;
    }
    
    // For all other cases, return the full amount
    return isNaN(source.amount) ? 0 : source.amount;
  }

  /**
   * Calculate the next payment date for an income source
   */
  static getNextPaymentDate(source: IncomeSource, fromDate: Date = new Date()): Date | null {
    if (source.frequency === 'ONE_TIME') {
      return null;
    }

    const currentDate = new Date(fromDate);
    
    switch (source.frequency) {
      case 'WEEKLY':
        return this.getNextWeeklyPayment(source, currentDate);
      
      case 'BIWEEKLY':
        return this.getNextBiweeklyPayment(source, currentDate);
      
      case 'MONTHLY':
        return this.getNextMonthlyPayment(source, currentDate);
      
      case 'QUARTERLY':
        return this.getNextQuarterlyPayment(source, currentDate);
      
      case 'YEARLY':
        return this.getNextYearlyPayment(source, currentDate);
      
      default:
        return null;
    }
  }

  /**
   * Get upcoming payment dates within a date range
   */
  static getUpcomingPayments(source: IncomeSource, fromDate: Date = new Date(), daysAhead: number = 30): PaymentDate[] {
    if (source.frequency === 'ONE_TIME') {
      return [];
    }

    const payments: PaymentDate[] = [];
    const endDate = new Date(fromDate);
    endDate.setDate(endDate.getDate() + daysAhead);

    let nextPaymentDate = this.getNextPaymentDate(source, fromDate);
    
    while (nextPaymentDate && nextPaymentDate <= endDate) {
      // Calculate amount for this specific payment date
      let paymentAmount: number;
      
      if (source.frequency === 'MONTHLY' && source.useManualAmounts && source.scheduleDayAmounts) {
        // Find the specific day for this payment
        const paymentDay = nextPaymentDate.getDate();
        const isLastDay = nextPaymentDate.getDate() === new Date(nextPaymentDate.getFullYear(), nextPaymentDate.getMonth() + 1, 0).getDate();
        
        // Check if this is the "last day" (31st) case
        const dayKey = isLastDay && source.scheduleDays?.includes(31) ? 31 : paymentDay;
        
        // Handle both string and number keys for scheduleDayAmounts (JSON comes with string keys)
        const dayAmounts = source.scheduleDayAmounts as Record<string, unknown>;
        const manualAmount = dayAmounts[dayKey] || dayAmounts[dayKey.toString()] || 0;
        paymentAmount = isNaN(Number(manualAmount)) ? 0 : Number(manualAmount);
      } else {
        paymentAmount = this.calculatePerPaymentAmount(source);
      }

      // Validate payment amount before adding
      if (paymentAmount > 0 && !isNaN(paymentAmount) && isFinite(paymentAmount)) {
        payments.push({
          date: new Date(nextPaymentDate),
          amount: paymentAmount
        });
      }

      // Get the next payment after this one
      const dayAfter = new Date(nextPaymentDate);
      dayAfter.setDate(dayAfter.getDate() + 1);
      nextPaymentDate = this.getNextPaymentDate(source, dayAfter);
      
      // Prevent infinite loops
      if (payments.length > 100) break;
    }

    return payments;
  }

  /**
   * Get recent payment dates within a date range
   */
  static getRecentPayments(source: IncomeSource, toDate: Date = new Date(), daysBefore: number = 30): PaymentDate[] {
    if (source.frequency === 'ONE_TIME') {
      return [];
    }

    const payments: PaymentDate[] = [];
    const startDate = new Date(toDate);
    startDate.setDate(startDate.getDate() - daysBefore);

    // Calculate per-payment amount for monthly frequency with multiple days
    const paymentAmount = this.calculatePerPaymentAmount(source);

    let currentDate = new Date(startDate);
    
    while (currentDate <= toDate) {
      const paymentDate = this.getNextPaymentDate(source, currentDate);
      
      if (paymentDate && paymentDate <= toDate && paymentDate >= startDate) {
        // Check if this payment date isn't already in our list
        const existingPayment = payments.find(p => 
          p.date.toDateString() === paymentDate.toDateString()
        );
        
        if (!existingPayment) {
          payments.push({
            date: new Date(paymentDate),
            amount: paymentAmount
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
      
      // Prevent infinite loops
      if (payments.length > 100) break;
    }

    return payments.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private static getNextWeeklyPayment(source: IncomeSource, fromDate: Date): Date | null {
    if (source.scheduleWeekday === undefined) return null;

    const nextPayment = new Date(fromDate);
    const currentDay = nextPayment.getDay();
    const targetDay = source.scheduleWeekday;
    
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7;
    }
    
    nextPayment.setDate(nextPayment.getDate() + daysUntilTarget);
    this.setPaymentTime(nextPayment, source.scheduleTime);
    
    return nextPayment;
  }

  private static getNextBiweeklyPayment(source: IncomeSource, fromDate: Date): Date | null {
    if (source.scheduleWeekday === undefined || !source.scheduleWeek) return null;

    const nextPayment = new Date(fromDate);
    const year = nextPayment.getFullYear();
    const month = nextPayment.getMonth();
    
    // Get the target week of the month
    const targetWeek = this.getWeekOfMonth(source.scheduleWeek, year, month);
    if (!targetWeek) return null;

    // Find the target day in that week
    const targetDate = this.findDayInWeek(targetWeek, source.scheduleWeekday);
    if (!targetDate) return null;

    // If the target date is in the past, move to next month
    if (targetDate <= fromDate) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      
      const nextTargetWeek = this.getWeekOfMonth(source.scheduleWeek, nextYear, nextMonth);
      if (!nextTargetWeek) return null;
      
      const nextTargetDate = this.findDayInWeek(nextTargetWeek, source.scheduleWeekday);
      if (!nextTargetDate) return null;
      
      this.setPaymentTime(nextTargetDate, source.scheduleTime);
      return nextTargetDate;
    }

    this.setPaymentTime(targetDate, source.scheduleTime);
    return targetDate;
  }

  private static getNextMonthlyPayment(source: IncomeSource, fromDate: Date): Date | null {
    if (!source.scheduleDays || source.scheduleDays.length === 0) return null;

    const nextPayment = new Date(fromDate);
    const currentYear = nextPayment.getFullYear();
    const currentMonth = nextPayment.getMonth();
    const currentDay = nextPayment.getDate();

    // Filter out days with zero amounts if using manual amounts
    let validScheduleDays = source.scheduleDays;
    if (source.useManualAmounts && source.scheduleDayAmounts) {
      const dayAmounts = source.scheduleDayAmounts as Record<string, unknown>;
      validScheduleDays = source.scheduleDays.filter(day => {
        const amount = dayAmounts[day] || dayAmounts[day.toString()] || 0;
        return Number(amount) > 0;
      });
    }

    if (validScheduleDays.length === 0) return null;

    // Check if any scheduled days in current month are still upcoming
    for (const day of validScheduleDays.sort((a, b) => a - b)) {
      const targetDate = new Date(currentYear, currentMonth, day);
      
      // Handle last day of month (day 31)
      if (day === 31) {
        targetDate.setMonth(currentMonth + 1, 0); // Last day of current month
      }
      
      // If this date is valid and in the future
      if (targetDate.getMonth() === currentMonth && targetDate > fromDate) {
        this.setPaymentTime(targetDate, source.scheduleTime);
        return targetDate;
      }
    }

    // No upcoming dates in current month, check next month
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    
    const firstScheduleDay = Math.min(...validScheduleDays);
    let nextPaymentDate: Date;
    
    if (firstScheduleDay === 31) {
      // Last day of next month
      nextPaymentDate = new Date(nextYear, nextMonth + 1, 0);
    } else {
      nextPaymentDate = new Date(nextYear, nextMonth, firstScheduleDay);
    }
    
    this.setPaymentTime(nextPaymentDate, source.scheduleTime);
    return nextPaymentDate;
  }

  private static getNextQuarterlyPayment(source: IncomeSource, fromDate: Date): Date | null {
    // For quarterly, use the first scheduled day of the next quarter
    if (!source.scheduleDays || source.scheduleDays.length === 0) return null;

    const nextPayment = new Date(fromDate);
    const currentMonth = nextPayment.getMonth();
    const firstScheduleDay = Math.min(...source.scheduleDays);
    
    // Find next quarter start month
    let nextQuarterMonth: number;
    if (currentMonth < 3) nextQuarterMonth = 3;
    else if (currentMonth < 6) nextQuarterMonth = 6;
    else if (currentMonth < 9) nextQuarterMonth = 9;
    else nextQuarterMonth = 0; // January of next year
    
    if (nextQuarterMonth === 0) {
      nextPayment.setFullYear(nextPayment.getFullYear() + 1);
    }
    
    nextPayment.setMonth(nextQuarterMonth, firstScheduleDay);
    this.setPaymentTime(nextPayment, source.scheduleTime);
    
    return nextPayment;
  }

  private static getNextYearlyPayment(source: IncomeSource, fromDate: Date): Date | null {
    // For yearly, use the first scheduled day of next year
    if (!source.scheduleDays || source.scheduleDays.length === 0) return null;

    const nextPayment = new Date(fromDate);
    const firstScheduleDay = Math.min(...source.scheduleDays);
    
    nextPayment.setFullYear(nextPayment.getFullYear() + 1);
    nextPayment.setMonth(0, firstScheduleDay); // January
    this.setPaymentTime(nextPayment, source.scheduleTime);
    
    return nextPayment;
  }

  private static getWeekOfMonth(weekType: string, year: number, month: number): Date | null {
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayWeekday = firstDayOfMonth.getDay();
    
    switch (weekType) {
      case 'FIRST':
        return new Date(year, month, 1);
      case 'SECOND':
        return new Date(year, month, 8 - firstDayWeekday);
      case 'THIRD':
        return new Date(year, month, 15 - firstDayWeekday);
      case 'FOURTH':
        return new Date(year, month, 22 - firstDayWeekday);
      case 'LAST':
        // Last week - find last occurrence of weekday
        const lastDayOfMonth = new Date(year, month + 1, 0);
        return new Date(year, month, lastDayOfMonth.getDate() - 6);
      default:
        return null;
    }
  }

  private static findDayInWeek(weekStart: Date, targetWeekday: number): Date | null {
    const result = new Date(weekStart);
    const currentWeekday = result.getDay();
    
    let daysToAdd = targetWeekday - currentWeekday;
    if (daysToAdd < 0) daysToAdd += 7;
    
    result.setDate(result.getDate() + daysToAdd);
    return result;
  }

  private static setPaymentTime(date: Date, timeString?: string): void {
    if (!timeString) {
      date.setHours(9, 0, 0, 0); // Default to 9:00 AM
      return;
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);
  }
}