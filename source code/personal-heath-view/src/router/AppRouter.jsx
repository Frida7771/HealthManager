import { Navigate, Route, Routes } from 'react-router-dom';
import Login from '@/pages/auth/Login.jsx';
import Register from '@/pages/auth/Register.jsx';
import AdminLayout from '@/layouts/AdminLayout.jsx';
import UserLayout from '@/layouts/UserLayout.jsx';
import ProtectedRoute from '@/components/ProtectedRoute.jsx';
import Dashboard from '@/pages/admin/Dashboard.jsx';
import UserManagement from '@/pages/admin/UserManagement.jsx';
import TagsManagement from '@/pages/admin/TagsManagement.jsx';
import NewsManagement from '@/pages/admin/NewsManagement.jsx';
import HealthModelConfig from '@/pages/admin/HealthModelConfig.jsx';
import UserHealthManagement from '@/pages/admin/UserHealthManagement.jsx';
import MessageManagement from '@/pages/admin/MessageManagement.jsx';
import EvaluationsManagement from '@/pages/admin/EvaluationsManagement.jsx';
import NewsFeed from '@/pages/user/NewsFeed.jsx';
import NewsSave from '@/pages/user/NewsSave.jsx';
import UserHealthModel from '@/pages/user/UserHealthModel.jsx';
import NewsDetail from '@/pages/user/NewsDetail.jsx';
import Search from '@/pages/user/Search.jsx';
import Record from '@/pages/user/Record.jsx';
import MessageCenter from '@/pages/user/MessageCenter.jsx';

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />

    <Route element={<ProtectedRoute allowedRoles={[1]} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="tags" element={<TagsManagement />} />
        <Route path="news" element={<NewsManagement />} />
        <Route path="model-config" element={<HealthModelConfig />} />
        <Route path="health-records" element={<UserHealthManagement />} />
        <Route path="messages" element={<MessageManagement />} />
        <Route path="evaluations" element={<EvaluationsManagement />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={[2]} />}>
      <Route path="/user" element={<UserLayout />}>
        <Route index element={<Navigate to="news-record" replace />} />
        <Route path="news-record" element={<NewsFeed />} />
        <Route path="my-save" element={<NewsSave />} />
        <Route path="user-health-model" element={<UserHealthModel />} />
        <Route path="news-detail" element={<NewsDetail />} />
        <Route path="search-detail" element={<Search />} />
        <Route path="record" element={<Record />} />
        <Route path="message" element={<MessageCenter />} />
      </Route>
      <Route path="/message" element={<MessageCenter />} />
      <Route path="/record" element={<Record />} />
    </Route>

    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
