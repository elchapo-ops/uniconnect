import { LayoutDashboard, Users, Building2, Briefcase, LineChart, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAnalytics } from '@/hooks/useApi';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: 'Students', href: '/admin/students', icon: <Users className="w-5 h-5" /> },
  { label: 'Employers', href: '/admin/employers', icon: <Building2 className="w-5 h-5" /> },
  { label: 'Jobs', href: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
  { label: 'Analytics', href: '/admin/analytics', icon: <LineChart className="w-5 h-5" /> },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useAnalytics();

  // Default values when loading
  const stats = analytics || {
    totalStudents: 0,
    placedStudents: 0,
    activeEmployers: 0,
    placementRate: 0,
    monthlyPlacements: [],
    topSkills: [],
    industries: [],
  };

  return (
    <DashboardLayout navItems={navItems} title="Admin Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.placedStudents}</p>
                <p className="text-xs text-muted-foreground">Placed Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.activeEmployers}</p>
                <p className="text-xs text-muted-foreground">Active Employers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <LineChart className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isLoading ? '-' : stats.placementRate}%</p>
                <p className="text-xs text-muted-foreground">Placement Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Monthly Placements Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Placements</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.monthlyPlacements?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.monthlyPlacements}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  No placement data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Skills in Demand</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topSkills?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topSkills.map((skill: any, index: number) => (
                    <div key={skill.skill || index} className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{skill.skill}</span>
                          <span className="text-sm text-muted-foreground">{skill.demand}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${skill.demand}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  No skills data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Industry Distribution */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Industry Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.industries?.length > 0 ? (
                <div className="flex items-center gap-8">
                  <div className="h-64 w-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.industries}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="percentage"
                        >
                          {stats.industries.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                    {stats.industries.map((industry: any, index: number) => (
                      <div key={industry.name || index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="flex-1 text-sm">{industry.name}</span>
                        <span className="text-sm text-muted-foreground">{industry.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                  No industry data yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
