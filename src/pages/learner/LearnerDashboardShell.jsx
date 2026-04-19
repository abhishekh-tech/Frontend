import React from 'react';
import { Outlet } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Heart, Award, MessageSquare, Zap } from 'lucide-react';
import DashboardLayout from '../../components/shared/DashboardLayout';

const LearnerDashboardShell = () => {
  const sidebarLinks = [
    { label: 'Overview', icon: LayoutDashboard, path: '/dashboard/learner' },
    { label: 'Enrolled Classes', icon: GraduationCap, path: '/dashboard/learner/enrolled' },
    { label: 'Explore Skills', icon: Zap, path: '/dashboard/learner/skills' },
    { label: 'Wishlist', icon: Heart, path: '/dashboard/learner/wishlist' },
    { label: 'Certificates', icon: Award, path: '/dashboard/learner/certificates' },
    { label: 'Messages', icon: MessageSquare, path: '/dashboard/learner/messages' },
  ];
  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <Outlet />
    </DashboardLayout>
  );
};

export default LearnerDashboardShell;
