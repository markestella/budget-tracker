'use client';

import React, { useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Section from "../components/ui/Section";
import { useTheme } from "../components/ThemeProvider";
import Typography from "../components/ui/Typography";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import FeatureCard from "../components/FeatureCard";
import PricingCard from "../components/PricingCard";
import TestimonialCard from "../components/TestimonialCard";
import ThemeToggle from "../components/ThemeToggle";

export default function Home() {
  const { isDark } = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect to dashboard if user is already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [status, session, router]);
  const pricingPlans = [
    {
      name: "Free",
      price: "₱0",
      period: "/month",
      features: ["Track expenses", "Set budgets", "Manage income"],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
      buttonLink: "/login",
    },
    {
      name: "Premium",
      price: "₱199",
      period: "/month",
      features: ["All Free features", "Cards Management", "Cloud Sync"],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "primary" as const,
    },
    {
      name: "Pro",
      price: "₱499",
      period: "/month",
      features: ["All Premium features", "Smart Analytics", "Multi-user sync"],
      buttonText: "Contact Sales",
      buttonVariant: "secondary" as const,
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <header className={`fixed top-0 left-0 right-0 backdrop-blur-sm border-b z-50 transition-colors duration-300 ${
        isDark 
          ? 'bg-gray-900/95 border-gray-700' 
          : 'bg-white/95 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <Typography variant="h4" color="dark">
                MoneySuite
              </Typography>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className={`font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Features
              </a>
              <a
                href="#insights"
                className={`font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Insights
              </a>
              <a
                href="#pricing"
                className={`font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Pricing
              </a>
              <a
                href="#security"
                className={`font-medium transition-colors ${
                  isDark 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Security
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <Link href="/login">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <Section
        variant="gradient-light"
        className="pt-24 pb-20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <Typography
              variant="h1"
              color="dark"
              className="mb-6"
            >
              Manage All Your Finances in One{" "}
              <span className={`${isDark ? '!text-blue-400' : '!text-blue-600'}`}>Suite</span>
            </Typography>

            <Typography
              variant="body-lg"
              color="medium"
              className="mb-8"
            >
              From income to expenses — track, plan, and grow your money smarter
              with MoneySuite. Your complete finance companion for modern
              living.
            </Typography>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link href="/login">
                <Button size="lg">
                  Get Started Free
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </div>

            <Typography
              variant="caption"
              color="light"
            >
              Access from any web browser, anywhere
            </Typography>
          </div>

          <div className="relative">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Typography
                  variant="h4"
                  color="dark"
                >
                  Dashboard Overview
                </Typography>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>

              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isDark 
                    ? 'bg-gradient-to-r from-green-900/40 to-green-800/30' 
                    : 'bg-gradient-to-r from-green-50 to-green-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 11l5-5m0 0l5 5m-5-5v12"
                        />
                      </svg>
                    </div>
                    <Typography
                      variant="body"
                      color="dark"
                    >
                      Income
                    </Typography>
                  </div>
                  <Typography
                    variant="body-lg"
                    color="success"
                    className="font-bold"
                  >
                    ₱45,000
                  </Typography>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isDark 
                    ? 'bg-gradient-to-r from-orange-900/40 to-orange-800/30' 
                    : 'bg-gradient-to-r from-orange-50 to-orange-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 13l-5 5m0 0l-5-5m5 5V6"
                        />
                      </svg>
                    </div>
                    <Typography
                      variant="body"
                      color="dark"
                    >
                      Expenses
                    </Typography>
                  </div>
                  <Typography
                    variant="body-lg"
                    color="warning"
                    className="font-bold"
                  >
                    ₱28,500
                  </Typography>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isDark 
                    ? 'bg-gradient-to-r from-blue-900/40 to-blue-800/30' 
                    : 'bg-gradient-to-r from-blue-50 to-blue-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                        />
                      </svg>
                    </div>
                    <Typography
                      variant="body"
                      color="dark"
                    >
                      Savings
                    </Typography>
                  </div>
                  <Typography
                    variant="body-lg"
                    color="primary"
                    className="font-bold"
                  >
                    ₱16,500
                  </Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section id="features" variant="white">
        <div className="text-center mb-16">
          <Typography variant="h2" color="dark" className="mb-4">
            Everything You Need to Manage Your Money
          </Typography>
          <Typography variant="body-lg" color="medium" className="max-w-2xl mx-auto">
            Powerful tools and insights to help you track expenses, manage budgets, and grow your wealth with confidence.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
            title="Smart Expense Tracking"
            description="Automatically categorize and track your expenses with intelligent recognition and custom categories."
            gradientType="primary"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            title="Budget Management"
            description="Set spending limits, track progress, and get alerts when you're approaching your budget limits."
            gradientType="success"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            }
            title="Income Management"
            description="Track multiple income sources, recurring payments, and monitor your cash flow patterns."
            gradientType="accent"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            }
            title="Savings Goals"
            description="Set and track savings goals with visual progress indicators and automated recommendations."
            gradientType="warning"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
            title="Detailed Reports"
            description="Generate comprehensive financial reports with charts, trends, and actionable insights."
            gradientType="primary"
          />

          <FeatureCard
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            }
            title="Cloud Sync"
            description="Access your data from any device with secure cloud synchronization and real-time updates."
            gradientType="success"
          />
        </div>
      </Section>

      <Section id="insights" variant="light">
        <div className="text-center mb-16">
          <Typography variant="h2" color="dark" className="mb-4">
            Smart Financial Insights
          </Typography>
          <Typography variant="body-lg" color="medium" className="max-w-2xl mx-auto">
            Get AI-powered insights and recommendations to optimize your financial health and make better money decisions.
          </Typography>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/40' : 'bg-blue-100'}`}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <Typography variant="h4" color="dark" className="mb-2">
                  Spending Analytics
                </Typography>
                <Typography variant="body" color="medium">
                  Visualize your spending patterns with interactive charts and identify areas for improvement.
                </Typography>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/40' : 'bg-green-100'}`}>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364-.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <Typography variant="h4" color="dark" className="mb-2">
                  Smart Recommendations
                </Typography>
                <Typography variant="body" color="medium">
                  Receive personalized recommendations to optimize your budget and increase your savings.
                </Typography>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/40' : 'bg-purple-100'}`}>
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <Typography variant="h4" color="dark" className="mb-2">
                  Goal Tracking
                </Typography>
                <Typography variant="body" color="medium">
                  Monitor progress towards your financial goals with predictive analytics and milestone tracking.
                </Typography>
              </div>
            </div>
          </div>

          <div className="relative">
            <Card className="p-6">
              <Typography variant="h4" color="dark" className="mb-6">
                Monthly Overview
              </Typography>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Typography variant="body" color="medium">Food & Dining</Typography>
                  <div className="flex items-center space-x-2">
                    <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="w-16 h-2 bg-orange-500 rounded-full"></div>
                    </div>
                    <Typography variant="body" color="dark" className="text-sm">₱8,500</Typography>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Typography variant="body" color="medium">Transportation</Typography>
                  <div className="flex items-center space-x-2">
                    <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="w-12 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <Typography variant="body" color="dark" className="text-sm">₱4,200</Typography>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="body" color="medium">Entertainment</Typography>
                  <div className="flex items-center space-x-2">
                    <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="w-8 h-2 bg-green-500 rounded-full"></div>
                    </div>
                    <Typography variant="body" color="dark" className="text-sm">₱2,100</Typography>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Typography variant="body" color="medium">Utilities</Typography>
                  <div className="flex items-center space-x-2">
                    <div className={`w-24 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <div className="w-20 h-2 bg-purple-500 rounded-full"></div>
                    </div>
                    <Typography variant="body" color="dark" className="text-sm">₱6,800</Typography>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <Typography variant="body" color="medium">Total Spent</Typography>
                  <Typography variant="h4" color="warning" className="font-bold">₱21,600</Typography>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Typography variant="body" color="medium">Budget Remaining</Typography>
                  <Typography variant="h4" color="success" className="font-bold">₱6,900</Typography>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Section>

      <Section id="security" variant="dark">
        <div className="text-center mb-16">
          <Typography variant="h2" color="white" className="mb-4">
            Your Financial Data is Secure
          </Typography>
          <Typography variant="body-lg" color="white" className="max-w-2xl mx-auto opacity-90">
            Enterprise-grade security measures protect your sensitive financial information with industry-leading encryption and privacy controls.
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <Typography variant="h4" color="white" className="mb-2">
              Bank-Level Encryption
            </Typography>
            <Typography variant="body" color="white" className="opacity-75">
              256-bit SSL encryption protects all your data in transit and at rest.
            </Typography>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <Typography variant="h4" color="white" className="mb-2">
              Privacy First
            </Typography>
            <Typography variant="body" color="white" className="opacity-75">
              Your data stays private. We never share or sell your financial information.
            </Typography>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m13 0h-6m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20h12a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <Typography variant="h4" color="white" className="mb-2">
              Two-Factor Auth
            </Typography>
            <Typography variant="body" color="white" className="opacity-75">
              Add an extra layer of security with multi-factor authentication options.
            </Typography>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <Typography variant="h4" color="white" className="mb-2">
              Regular Backups
            </Typography>
            <Typography variant="body" color="white" className="opacity-75">
              Automated daily backups ensure your financial data is never lost.
            </Typography>
          </div>
        </div>

        <div className="mt-16 text-center">
          <Card className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <Typography variant="h4" color="dark">SOC 2 Compliant</Typography>
                  <Typography variant="body" color="medium">Security audited</Typography>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <Typography variant="h4" color="dark">GDPR Ready</Typography>
                  <Typography variant="body" color="medium">Privacy compliant</Typography>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <Typography variant="h4" color="dark">PCI DSS</Typography>
                  <Typography variant="body" color="medium">Payment secure</Typography>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <Section id="pricing" variant="light">
        <div className="text-center mb-16">
          <Typography variant="h2" color="dark" className="mb-4">
            Choose the Plan That Fits You
          </Typography>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>
      </Section>

      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <Typography variant="h4" color="white">
                  MoneySuite
                </Typography>
              </div>
              <Typography
                variant="body"
                color="white"
                className="opacity-75 mb-4"
              >
                Your complete finance management app — track, plan, and save
                smarter.
              </Typography>
            </div>

            <div>
              <Typography variant="h4" color="white" className="mb-4">
                Features
              </Typography>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Income Manager
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Budget Manager
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Expense Tracker
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Savings Management
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Cards Management
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h4" color="white" className="mb-4">
                Company
              </Typography>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Support
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <Typography variant="h4" color="white" className="mb-4">
                Legal
              </Typography>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <Typography variant="body" color="white" className="opacity-60">
              © 2025 MoneySuite. All rights reserved.
            </Typography>
          </div>
        </div>
      </footer>
    </div>
  );
}
