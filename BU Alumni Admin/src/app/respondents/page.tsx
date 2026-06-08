'use client';

import { AdminLayout } from '@/components/admin-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RespondentsTable } from '../_components/respondents-table';

export default function RespondentsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-forest dark:text-sidebar-foreground">Respondents</h1>
          <p className="text-muted-foreground mt-1">
            View and export GTS survey submissions.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>GTS Responses</CardTitle>
            <CardDescription>All submitted tracer study responses.</CardDescription>
          </CardHeader>
          <CardContent>
            <RespondentsTable />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
