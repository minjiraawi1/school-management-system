import { useEffect, useState } from 'react';
import { getPendingApprovals, approveResult, rejectResult } from '../../services/resultsService';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const ResultsApproval = () => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const data = await getPendingApprovals();
      setApprovals(data);
      setError(null);
    } catch (error) {
      console.error(error);
      setError('Failed to fetch pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      setProcessingId(id);
      await approveResult(id);
      setSuccess('Result approved successfully');
      // Remove from list locally
      setApprovals(approvals.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
      setError('Failed to approve result');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this result?')) return;
    
    try {
      setProcessingId(id);
      await rejectResult(id, 'Rejected by admin'); // You could add a prompt for notes here
      setSuccess('Result rejected successfully');
      // Remove from list locally
      setApprovals(approvals.filter(a => a.id !== id));
    } catch (error) {
      console.error(error);
      setError('Failed to reject result');
    } finally {
      setProcessingId(null);
    }
  };

  const resetStatus = () => {
    setError(null);
    setSuccess('');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Result Approvals</h1>
          <p className="text-muted-foreground">Review and approve student results submitted by teachers</p>
        </div>
        <Button onClick={fetchApprovals} variant="outline" size="sm" className="gap-2">
           Refresh List
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md flex items-center gap-2" onAnimationEnd={resetStatus}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md flex items-center gap-2" onAnimationEnd={resetStatus}>
          <CheckCircle size={18} />
          {success}
        </div>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Scores (T1 / T2)</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">Loading pending approvals...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : approvals.length > 0 ? (
                approvals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(item.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.student_first_name} {item.student_last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{item.subject_name}</span>
                        <span className="text-xs text-muted-foreground">{item.subject_code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.teacher_first_name} {item.teacher_last_name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">
                          Term 1: <span className="font-semibold">{item.term_1_total || '-'}</span>
                        </span>
                        <span className="text-xs">
                          Term 2: <span className="font-semibold">{item.term_2_total || '-'}</span>
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(item.id)}
                        disabled={processingId === item.id}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {processingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} className="mr-1" />}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(item.id)}
                        disabled={processingId === item.id}
                      >
                        <XCircle size={14} className="mr-1" /> Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No pending approvals found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsApproval;
