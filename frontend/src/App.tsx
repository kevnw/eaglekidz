import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Card, Button, Typography } from 'antd';
import { CalendarOutlined, FileTextOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons';
import { WeeksPage, AddReviewPage, ViewReviewsPage, EditReviewPage } from './components';
import { MinistersPage, ChildrenPage } from './components/people';
import { ReviewsPage } from './components/pages';
import { apiService, ApiResponse, HealthData } from './services/api';
import 'antd/dist/reset.css';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

function HomePage() {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <Title level={1} style={{ color: '#1890ff', marginBottom: '16px' }}>
          EagleKidz Church Management
        </Title>
        <Paragraph style={{ fontSize: '18px', color: '#666' }}>
          Manage weekly church activities and reviews
        </Paragraph>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <Link to="/weeks" style={{ textDecoration: 'none' }}>
          <Card
            hoverable
            style={{ height: '100%', borderRadius: '12px' }}
            bodyStyle={{ padding: '32px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={3} style={{ marginBottom: '12px' }}>Weeks Management</Title>
              <Paragraph style={{ marginBottom: '24px', color: '#666' }}>
                Create and manage weekly periods for church activities
              </Paragraph>
              <Button type="primary" size="large">
                Manage Weeks
              </Button>
            </div>
          </Card>
        </Link>
        
        <Link to="/reviews" style={{ textDecoration: 'none' }}>
          <Card
            hoverable
            style={{ height: '100%', borderRadius: '12px' }}
            bodyStyle={{ padding: '32px' }}
          >
            <div style={{ textAlign: 'center' }}>
              <FileTextOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={3} style={{ marginBottom: '12px' }}>Reviews</Title>
              <Paragraph style={{ marginBottom: '24px', color: '#666' }}>
                Track weekly reviews and improvements
              </Paragraph>
              <Button type="primary" size="large">
                View Reviews
              </Button>
            </div>
          </Card>
        </Link>
        
        <Card
          style={{ height: '100%', borderRadius: '12px' }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
            <Title level={3} style={{ marginBottom: '12px' }}>People Management</Title>
            <Paragraph style={{ marginBottom: '24px', color: '#666' }}>
              Manage ministers and children information
            </Paragraph>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/people/ministers" style={{ textDecoration: 'none' }}>
                <Button type="primary" size="large">
                  Manage Ministers
                </Button>
              </Link>
              <Link to="/people/children" style={{ textDecoration: 'none' }}>
                <Button type="primary" size="large">
                  Manage Children
                </Button>
              </Link>
            </div>
          </div>
        </Card>
        
        <Card
          style={{ height: '100%', borderRadius: '12px', opacity: 0.7 }}
          bodyStyle={{ padding: '32px' }}
        >
          <div style={{ textAlign: 'center' }}>
            <BarChartOutlined style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }} />
            <Title level={3} style={{ marginBottom: '12px', color: '#999' }}>Reports</Title>
            <Paragraph style={{ marginBottom: '24px', color: '#999' }}>
              Generate reports and analytics
            </Paragraph>
            <Button disabled size="large">
              Coming Soon
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Navigation() {
  const location = useLocation();
  
  const getSelectedKey = () => {
    if (location.pathname === '/') return 'home';
    if (location.pathname.startsWith('/weeks')) return 'weeks';
    if (location.pathname.startsWith('/people')) return 'people';
    if (location.pathname.startsWith('/reviews')) return 'reviews';
    return 'home';
  };

  const menuItems = [
    {
      key: 'home',
      icon: <CalendarOutlined />,
      label: <Link to="/" style={{ textDecoration: 'none', marginLeft: '1px' }}>Home</Link>,
    },
    {
      key: 'weeks',
      icon: <CalendarOutlined />,
      label: <Link to="/weeks" style={{ textDecoration: 'none', marginLeft: '1px' }}>Weeks</Link>,
    },
    {
      key: 'people',
      icon: <TeamOutlined />,
      label: 'People',
      children: [
        {
          key: 'ministers',
          label: <Link to="/people/ministers" style={{ textDecoration: 'none' }}>Ministers</Link>,
        },
        {
          key: 'children',
          label: <Link to="/people/children" style={{ textDecoration: 'none' }}>Children</Link>,
        },
      ],
    },
    {
      key: 'reviews',
      icon: <FileTextOutlined />,
      label: <Link to="/reviews" style={{ textDecoration: 'none', marginLeft: '1px' }}>Reviews</Link>,
    },
  ];

  return (
    <Header style={{ 
      display: 'flex', 
      alignItems: 'center', 
      background: '#fff', 
      borderBottom: '1px solid #f0f0f0',
      padding: '0 24px'
    }}>
      <div style={{ 
        color: '#1890ff', 
        fontSize: '24px', 
        fontWeight: 'bold', 
        marginRight: '48px' 
      }}>
        EagleKidz
      </div>
      <Menu
        mode="horizontal"
        selectedKeys={[getSelectedKey()]}
        items={menuItems}
        style={{ 
          flex: 1, 
          minWidth: 0, 
          border: 'none',
          background: 'transparent'
        }}
      />
    </Header>
  );
}

function App() {
  const theme = {
    token: {
      colorPrimary: '#fadb14', // Yellow theme
      colorLink: '#fadb14',
      borderRadius: 8,
    },
  };

  return (
    <ConfigProvider theme={theme}>
      <Router>
        <Layout style={{ minHeight: '100vh' }}>
          <Navigation />
          
          <Content style={{ background: '#f5f5f5' }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/weeks" element={<WeeksPage />} />
              <Route path="/weeks/:weekId/add-review" element={<AddReviewPage />} />
              <Route path="/weeks/:weekId/reviews" element={<ViewReviewsPage />} />
              <Route path="/weeks/:weekId/reviews/:reviewId/edit" element={<EditReviewPage />} />
              <Route path="/people/ministers" element={<MinistersPage />} />
              <Route path="/people/children" element={<ChildrenPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/reviews/:reviewId" element={<ViewReviewsPage />} />
              <Route path="/reviews/:reviewId/edit" element={<EditReviewPage />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}

export default App;
