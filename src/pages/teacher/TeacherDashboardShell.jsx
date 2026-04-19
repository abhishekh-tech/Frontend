import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, BookOpenCheck, Users, MessageSquare, Award, Zap } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';

const TeacherDashboardShell = () => {
  const sidebarLinks = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/teacher' },
    { label: 'My Classes', icon: BookOpenCheck, path: '/dashboard/teacher/classes' },
    { label: 'Skills', icon: Zap, path: '/dashboard/teacher/skills' },
    { label: 'Students', icon: Users, path: '/dashboard/teacher/students' },
    { label: 'Certificates', icon: Award, path: '/dashboard/teacher/certificates' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/teacher/messages' },
  ];
  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <Outlet />
    </DashboardLayout>
  );
};

export default TeacherDashboardShell;
