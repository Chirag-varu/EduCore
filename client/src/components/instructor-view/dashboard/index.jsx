import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign, Users } from "lucide-react";
import { fetchInstructorCourseStudentDetailsService } from "@/services";

function InstructorDashboard({ listOfCourses = [] }) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalProfit: 0,
    studentList: [],
  });

  useEffect(() => {
    async function calculateTotalStudentsAndProfit() {
      let totalStudents = 0;
      let totalProfit = 0;
      let studentList = [];

      for (const course of listOfCourses) {
        const studentCount = course.enrolledStudents?.length || 0;
        totalStudents += studentCount;
        totalProfit += (course.price || 0) * studentCount;

        if (studentCount > 0) {
          const students = await Promise.all(
            course.enrolledStudents.map(async (studentID) => {
              const studentDetails =
                await fetchInstructorCourseStudentDetailsService(studentID);

              return {
                courseTitle: course.title,
                studentName: studentDetails?.data?.userName || "N/A",
                studentEmail: studentDetails?.data?.userEmail || "N/A",
              };
            })
          );
          studentList.push(...students);
        }
      }

      setStats({ totalStudents, totalProfit, studentList });
    }

    calculateTotalStudentsAndProfit();
  }, [listOfCourses]);

  const config = [
    {
      icon: Users,
      label: "Total Students",
      value: stats.totalStudents,
    },
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: stats.totalProfit,
    },
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {config.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.label}
              </CardTitle>
              <item.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Students List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Course Name</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.studentList.length > 0 ? (
                  stats.studentList.map((studentItem, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {studentItem.courseTitle}
                      </TableCell>
                      <TableCell>{studentItem.studentName}</TableCell>
                      <TableCell>{studentItem.studentEmail}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      No students enrolled yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default InstructorDashboard;
