import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../services/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ChevronRight, BookOpen, Calendar, Users } from 'lucide-react';

const SelectAssignments = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get(`/assignments/teacher/me`);
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setAssignments(data);
      } catch (e) {
        console.error('Error fetching assignments:', e);
        setError('Failed to load assignments');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const handleSelectAssignment = (assignment) => {
    navigate(
      `/teacher/results?class=${assignment.class_id}&subject=${assignment.subject_id}&year=${assignment.academic_year}`
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Results</h1>
        <p className="text-muted-foreground">Select an assignment to manage student results</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.length > 0 ? (
          assignments.map((assignment) => (
            <Card
              key={`${assignment.class_id}-${assignment.subject_id}-${assignment.academic_year}`}
              onClick={() => handleSelectAssignment(assignment)}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{assignment.subject_name}</CardTitle>
                <CardDescription>{assignment.subject_code}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Users size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Class</p>
                      <p className="font-medium">{assignment.class_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Calendar size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Academic Year</p>
                      <p className="font-medium">{assignment.academic_year}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <BookOpen size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Subject</p>
                      <p className="font-medium">{assignment.subject_name}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-primary font-medium text-sm">
                  <span>Manage Results</span>
                  <ChevronRight size={16} />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg">
            <BookOpen size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">No assignments found</p>
            <p className="text-sm text-muted-foreground mt-1">
              You haven&apos;t been assigned any subjects yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectAssignments;
