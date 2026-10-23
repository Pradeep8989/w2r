import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';

// Public
import { LandingPage } from './pages/public/LandingPage';

// Customer
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { ScanWastePage } from './pages/customer/ScanWastePage';
import { WasteAnalysisPage } from './pages/customer/WasteAnalysisPage';
import { RecoveryOptionsPage } from './pages/customer/RecoveryOptionsPage';
import { CreateListingPage } from './pages/customer/CreateListingPage';
import { MyListingsPage } from './pages/customer/MyListingsPage';
import { ListingDetailPage } from './pages/customer/ListingDetailPage';
import { CollectionPointsPage } from './pages/customer/CollectionPointsPage';
import { RewardsPage } from './pages/customer/RewardsPage';
import { EnvironmentalImpactPage } from './pages/customer/EnvironmentalImpactPage';

// Recycler
import { RecyclerDashboard } from './pages/recycler/RecyclerDashboard';
import { IncomingRequestsPage } from './pages/recycler/IncomingRequestsPage';
import { RecyclerListingDetailPage } from './pages/recycler/RecyclerListingDetailPage';
import { PickupManagementPage } from './pages/recycler/PickupManagementPage';
import { WeightVerificationPage } from './pages/recycler/WeightVerificationPage';

// Admin
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { MaterialPricingPage } from './pages/admin/MaterialPricingPage';
import { RecyclerManagementPage } from './pages/admin/RecyclerManagementPage';
import { ClassificationEvaluationPage } from './pages/admin/ClassificationEvaluationPage';
import { BeforeAfterImpactPage } from './pages/admin/BeforeAfterImpactPage';
import { MethodologyPage } from './pages/admin/MethodologyPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    element: <AppShell />,
    children: [
      // Customer Portal
      { path: '/customer', element: <CustomerDashboard /> },
      { path: '/customer/scan', element: <ScanWastePage /> },
      { path: '/customer/analysis', element: <WasteAnalysisPage /> },
      { path: '/customer/recovery', element: <RecoveryOptionsPage /> },
      { path: '/customer/listings/new', element: <CreateListingPage /> },
      { path: '/customer/listings', element: <MyListingsPage /> },
      { path: '/customer/listings/:id', element: <ListingDetailPage /> },
      { path: '/customer/collection-points', element: <CollectionPointsPage /> },
      { path: '/customer/rewards', element: <RewardsPage /> },
      { path: '/customer/impact', element: <EnvironmentalImpactPage /> },

      // Recycler Portal
      { path: '/recycler', element: <RecyclerDashboard /> },
      { path: '/recycler/requests', element: <IncomingRequestsPage /> },
      { path: '/recycler/requests/:id', element: <RecyclerListingDetailPage /> },
      { path: '/recycler/pickups', element: <PickupManagementPage /> },
      { path: '/recycler/verification/:id', element: <WeightVerificationPage /> },

      // Admin Portal
      { path: '/admin', element: <AdminOverviewPage /> },
      { path: '/admin/materials', element: <MaterialPricingPage /> },
      { path: '/admin/recyclers', element: <RecyclerManagementPage /> },
      { path: '/admin/evaluation', element: <ClassificationEvaluationPage /> },
      { path: '/admin/impact', element: <BeforeAfterImpactPage /> },
      { path: '/admin/methodology', element: <MethodologyPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
