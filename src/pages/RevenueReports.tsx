import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, CreditCard, Receipt, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function RevenueReports() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  // Demo revenue data
  const revenueData = {
    thisMonth: 45280,
    lastMonth: 42150,
    growth: 7.4,
    avgPerPatient: 285,
    totalTransactions: 159,
    paymentMethods: {
      cash: 35.2,
      card: 48.6,
      insurance: 16.2
    },
    topTreatments: [
      { name: "Dental Cleaning", revenue: 8940, count: 42, avgPrice: 213 },
      { name: "Tooth Filling", revenue: 7200, count: 24, avgPrice: 300 },
      { name: "Crown Placement", revenue: 6800, count: 8, avgPrice: 850 },
      { name: "Root Canal", revenue: 5500, count: 11, avgPrice: 500 },
      { name: "Teeth Whitening", revenue: 4200, count: 21, avgPrice: 200 }
    ],
    dailyRevenue: [
      { date: "Dec 1", amount: 1520, patients: 8 },
      { date: "Dec 2", amount: 1890, patients: 12 },
      { date: "Dec 3", amount: 2100, patients: 9 },
      { date: "Dec 4", amount: 1750, patients: 11 },
      { date: "Dec 5", amount: 2340, patients: 14 },
      { date: "Dec 6", amount: 1680, patients: 7 },
      { date: "Dec 7", amount: 980, patients: 4 }
    ]
  };

  const handleExportReport = async (type: string) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      let data;
      let filename;
      
      if (type === 'treatments') {
        data = revenueData.topTreatments;
        filename = 'treatment_revenue_report';
      } else if (type === 'daily') {
        data = revenueData.dailyRevenue;
        filename = 'daily_revenue_report';
      } else {
        data = [revenueData];
        filename = 'monthly_summary_report';
      }
      
      const csvContent = "data:text/csv;charset=utf-8," + 
        Object.keys(data[0]).join(",") + "\n" +
        data.map(row => Object.values(row).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Report Exported",
        description: `Revenue report downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Revenue Reports</h1>
          <p className="text-muted-foreground">Track financial performance and revenue trends</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExportReport('summary')} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.thisMonth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ {revenueData.growth}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg per Patient</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueData.avgPerPatient}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600">↑ 3.2%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↑ 12</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData.growth}%</div>
            <p className="text-xs text-muted-foreground">
              Month over month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="treatments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="treatments">Top Treatments</TabsTrigger>
          <TabsTrigger value="daily">Daily Breakdown</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
        </TabsList>

        <TabsContent value="treatments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Revenue by Treatment Type</CardTitle>
                <CardDescription>Most profitable treatments this month</CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleExportReport('treatments')} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.topTreatments.map((treatment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{treatment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {treatment.count} procedures • Avg: ${treatment.avgPrice}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">${treatment.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {((treatment.revenue / revenueData.thisMonth) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daily Revenue Breakdown</CardTitle>
                <CardDescription>Revenue performance over the last 7 days</CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleExportReport('daily')} disabled={loading}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {revenueData.dailyRevenue.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">{day.date}</Badge>
                      <div>
                        <p className="font-medium">${day.amount.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">{day.patients} patients</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        ${Math.round(day.amount / day.patients)} avg per patient
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Distribution</CardTitle>
              <CardDescription>How patients prefer to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Credit/Debit Card</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{revenueData.paymentMethods.card}%</span>
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${revenueData.paymentMethods.card}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4" />
                      <span>Cash</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{revenueData.paymentMethods.cash}%</span>
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${revenueData.paymentMethods.cash}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Receipt className="w-4 h-4" />
                      <span>Insurance</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{revenueData.paymentMethods.insurance}%</span>
                      <div className="w-24 bg-secondary rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${revenueData.paymentMethods.insurance}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${Math.round((revenueData.thisMonth * revenueData.paymentMethods.cash) / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Cash Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ${Math.round((revenueData.thisMonth * revenueData.paymentMethods.card) / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Card Revenue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">
                      ${Math.round((revenueData.thisMonth * revenueData.paymentMethods.insurance) / 100).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Insurance Revenue</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Projected revenue for next quarter</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Next Month Projection</span>
                  <Badge variant="outline">${Math.round(revenueData.thisMonth * 1.074).toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Quarterly Target</span>
                  <Badge variant="secondary">${Math.round(revenueData.thisMonth * 3.2).toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Annual Projection</span>
                  <Badge>${Math.round(revenueData.thisMonth * 12.8).toLocaleString()}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Insights</CardTitle>
                <CardDescription>AI-powered revenue optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <p className="text-sm font-medium text-green-800">Treatment Mix Optimization</p>
                  <p className="text-xs text-green-600">Focus on crown procedures for +15% revenue</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="text-sm font-medium text-blue-800">Peak Hour Scheduling</p>
                  <p className="text-xs text-blue-600">Book high-value treatments during peak hours</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-400">
                  <p className="text-sm font-medium text-amber-800">Payment Recovery</p>
                  <p className="text-xs text-amber-600">$3,200 in pending insurance claims</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}