import React, { useState, useEffect } from 'react';
import { Form, DatePicker, Button, Card, Typography, Alert, Spin, Space, Tag, Row, Col } from 'antd';
import { CalendarOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { apiService, CreateWeekRequest, Week } from '../../services/api';
import dayjs, { Dayjs } from 'dayjs';

const { Title, Text } = Typography;

interface CreateWeekProps {
  onWeekCreated?: () => void;
}

const CreateWeek: React.FC<CreateWeekProps> = ({ onWeekCreated }) => {
  const [form] = Form.useForm();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [weekStart, setWeekStart] = useState<Dayjs | null>(null);
  const [weekEnd, setWeekEnd] = useState<Dayjs | null>(null);
  const [existingWeeks, setExistingWeeks] = useState<Week[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdWeek, setCreatedWeek] = useState<Week | null>(null);

  // Fetch existing weeks to show in calendar
  useEffect(() => {
    const fetchExistingWeeks = async () => {
      try {
        const response = await apiService.getAllWeeks();
        if (response.data) {
          setExistingWeeks(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch existing weeks:', err);
      }
    };
    fetchExistingWeeks();
  }, []);

  // Calculate Sunday to Saturday week from any selected date
  const calculateWeekDates = (date: Dayjs) => {
    if (!date) {
      setWeekStart(null);
      setWeekEnd(null);
      return;
    }

    const dayOfWeek = date.day(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate Sunday (start of week)
    const sunday = date.subtract(dayOfWeek, 'day');
    
    // Calculate Saturday (end of week)
    const saturday = sunday.add(6, 'day');
    
    setWeekStart(sunday);
    setWeekEnd(saturday);
  };

  // Check if a week already exists
  const isWeekAlreadyExists = (startDate: Dayjs, endDate: Dayjs) => {
    return existingWeeks.some(week => {
      const existingStart = dayjs(week.start_time).format('YYYY-MM-DD');
      const existingEnd = dayjs(week.end_time).format('YYYY-MM-DD');
      const newStart = startDate.format('YYYY-MM-DD');
      const newEnd = endDate.format('YYYY-MM-DD');
      return existingStart === newStart && existingEnd === newEnd;
    });
  };

  const handleDateChange = (date: Dayjs | null) => {
    setSelectedDate(date);
    setError(null);
    setSuccess(null);
    setCreatedWeek(null);
    
    if (date) {
      calculateWeekDates(date);
    } else {
      setWeekStart(null);
      setWeekEnd(null);
    }
  };

  const handleSubmit = async () => {
    if (!weekStart || !weekEnd) {
      setError('Please select a date to create a week');
      return;
    }

    // Check if week already exists
    if (isWeekAlreadyExists(weekStart, weekEnd)) {
      setError('A week for this period already exists. Please select a different date.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const start = weekStart.startOf('day').toISOString();
      const end = weekEnd.endOf('day').toISOString();

      const weekData: CreateWeekRequest = {
        start_time: start,
        end_time: end
      };

      const response = await apiService.createWeek(weekData);
      
      if (response.data) {
        setCreatedWeek(response.data);
        setSuccess('Week created successfully!');
        form.resetFields();
        setSelectedDate(null);
        setWeekStart(null);
        setWeekEnd(null);
        
        // Refresh the existing weeks list
        const updatedResponse = await apiService.getAllWeeks();
        if (updatedResponse.data) {
          setExistingWeeks(updatedResponse.data);
        }
        
        if (onWeekCreated) {
          onWeekCreated();
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to create week. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Dayjs) => {
    return date.format('dddd, MMMM D, YYYY');
  };

  const disabledDate = (current: Dayjs) => {
    // Disable dates that would create duplicate weeks
    if (!current) return false;
    
    const dayOfWeek = current.day();
    const sunday = current.subtract(dayOfWeek, 'day');
    const saturday = sunday.add(6, 'day');
    
    return isWeekAlreadyExists(sunday, saturday);
  };

  // Show success state
  if (createdWeek) {
    return (
      <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={3} style={{ color: '#52c41a', marginBottom: '16px' }}>
            Week Created Successfully!
          </Title>
          
          <Card size="small" style={{ marginBottom: '24px', background: '#f6ffed' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong>Week Period:</Text>
              <Text>{formatDate(dayjs(createdWeek.start_time))} - {formatDate(dayjs(createdWeek.end_time))}</Text>
              <Text type="secondary">Created: {dayjs(createdWeek.created_at).format('MMMM D, YYYY [at] h:mm A')}</Text>
            </Space>
          </Card>
          
          <Space>
            <Button 
              type="primary" 
              onClick={() => {
                setCreatedWeek(null);
                setSuccess(null);
              }}
            >
              Create Another Week
            </Button>
          </Space>
        </div>
      </Card>
    );
  }

  return (
    <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <CalendarOutlined style={{ fontSize: '32px', color: '#fadb14', marginBottom: '8px' }} />
        <Title level={3} style={{ marginBottom: '8px' }}>Create New Week</Title>
        <Text type="secondary">Select any date to create a Sunday-Saturday week period</Text>
      </div>

      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      {success && (
        <Alert
          message="Success"
          description={success}
          type="success"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Select Date"
          name="date"
          rules={[{ required: true, message: 'Please select a date!' }]}
        >
          <DatePicker
            value={selectedDate}
            onChange={handleDateChange}
            disabledDate={disabledDate}
            style={{ width: '100%' }}
            size="large"
            placeholder="Choose any date within the week"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        {weekStart && weekEnd && (
          <Card size="small" style={{ marginBottom: '16px', background: '#fffbe6' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Week Start (Sunday):</Text>
                  <Tag color="green">{formatDate(weekStart)}</Tag>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text strong>Week End (Saturday):</Text>
                  <Tag color="blue">{formatDate(weekEnd)}</Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!weekStart || !weekEnd}
            size="large"
            style={{ width: '100%' }}
          >
            {loading ? 'Creating Week...' : 'Create Week'}
          </Button>
        </Form.Item>
      </Form>

      {existingWeeks.length > 0 && (
        <Card size="small" title="Existing Weeks" style={{ marginTop: '16px' }}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {existingWeeks.slice(-5).map((week, index) => (
              <div key={week.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text>
                  {formatDate(dayjs(week.start_time))} - {formatDate(dayjs(week.end_time))}
                </Text>
                <Tag color="default">Week {existingWeeks.length - index}</Tag>
              </div>
            ))}
            {existingWeeks.length > 5 && (
              <Text type="secondary">... and {existingWeeks.length - 5} more weeks</Text>
            )}
          </Space>
        </Card>
      )}
    </Card>
  );
};

export default CreateWeek;