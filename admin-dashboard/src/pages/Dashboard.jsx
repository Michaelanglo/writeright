import { useState, useEffect } from 'react';
import { mockParents, mockChildren, mockSessions, mockMastery } from '../lib/mockData';
import StatCard from '../components/StatCard';
import { Users, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChildren: 0,
    totalSessions: 0,
    avgScore: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState([]);
  const [masteryData, setMasteryData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Use mock data instead of Supabase
      const accountCount = mockParents.length;
      const childrenCount = mockChildren.length;
      const sessionsCount = mockSessions.length;
      const sessions = mockSessions;

      const avgScore = sessions && sessions.length > 0
        ? sessions.reduce((sum, s) => sum + parseFloat(s.score), 0) / sessions.length
        : 0;

      setStats({
        totalUsers: accountCount || 0,
        totalChildren: childrenCount || 0,
        totalSessions: sessionsCount || 0,
        avgScore: avgScore.toFixed(1),
      });

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSessions = mockSessions.filter(
        session => new Date(session.session_date) >= sevenDaysAgo
      ).sort((a, b) => new Date(a.session_date) - new Date(b.session_date));

      const sessionsByDate = {};
      recentSessions?.forEach(session => {
        const date = new Date(session.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!sessionsByDate[date]) {
          sessionsByDate[date] = { date, count: 0, totalScore: 0 };
        }
        sessionsByDate[date].count++;
        sessionsByDate[date].totalScore += parseFloat(session.score);
      });

      const chartData = Object.values(sessionsByDate).map(day => ({
        date: day.date,
        sessions: day.count,
        avgScore: (day.totalScore / day.count).toFixed(1),
      }));

      setSessionData(chartData);

      const masteryCount = { beginner: 0, intermediate: 0, advanced: 0, master: 0 };
      mockMastery?.forEach(m => {
        masteryCount[m]++;
      });

      const masteryChartData = Object.entries(masteryCount).map(([level, count]) => ({
        level: level.charAt(0).toUpperCase() + level.slice(1),
        count,
      }));

      setMasteryData(masteryChartData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-lg" />
          <Skeleton className="h-80 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">Platform activity and key metrics</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Parents" value={stats.totalUsers} icon={Users} />
        <StatCard title="Total Children" value={stats.totalChildren} icon={GraduationCap} />
        <StatCard title="Practice Sessions" value={stats.totalSessions} icon={TrendingUp} />
        <StatCard title="Avg. Score" value={`${stats.avgScore}%`} icon={Award} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Sessions this week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={sessionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: 'none',
                    fontSize: '13px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke="var(--chart-primary)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: 'var(--chart-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Mastery distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={masteryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="level" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: 'none',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
