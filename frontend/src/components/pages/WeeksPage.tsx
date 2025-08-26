import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { CreateWeek, WeeksList } from '../weeks';

const { Title, Paragraph } = Typography;

const WeeksPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState('list');

  const handleWeekCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('list'); // Switch to list view after creating
  };

  const tabItems = [
    {
      key: 'list',
      label: (
        <span>
          <CalendarOutlined />
          <span style={{ marginLeft: '1px' }}>View Weeks</span>
        </span>
      ),
      children: <WeeksList refreshTrigger={refreshTrigger} />,
    },
    {
      key: 'create',
      label: (
        <span>
          <PlusOutlined />
          <span style={{ marginLeft: '1px' }}>Create Week</span>
        </span>
      ),
      children: <CreateWeek onWeekCreated={handleWeekCreated} />,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <Title level={1} style={{ marginBottom: '8px' }}>
          Church Weeks Management
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          Manage weekly periods for church reviews and activities
        </Paragraph>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
        style={{ background: '#fff', borderRadius: '8px', padding: '16px' }}
      />
    </div>
  );
};

export default WeeksPage;