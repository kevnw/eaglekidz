import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Alert,
  Spin,
  Space,
  Row,
  Col,
  Divider,
  Tag,
  message
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  CalendarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { apiService, CreateReviewRequest, Review } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface LocationState {
  weekTitle?: string;
}

const AddReviewPage: React.FC = () => {
  const { weekId } = useParams<{ weekId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdReview, setCreatedReview] = useState<Review | null>(null);

  const weekTitle = state?.weekTitle || `Week ${weekId}`;

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);

    try {
      if (!weekId) {
        throw new Error('Week ID is missing');
      }

      const reviewData: CreateReviewRequest = {
        week_id: weekId,
        what_went_well: values.whatWentWell.trim(),
        can_improve: values.canImprove.trim(),
        action_plans: values.actionPlans.trim(),
        summary: values.summary.trim(),
      };

      const response = await apiService.createReview(reviewData);
      
      if (response.data) {
        setCreatedReview(response.data);
        form.resetFields();
        message.success('Review created successfully!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWeeks = () => {
    navigate('/weeks');
  };

  const handleAddAnother = () => {
    setCreatedReview(null);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  // Show created review
  if (createdReview) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToWeeks}
              style={{ marginBottom: '16px' }}
            >
              Back to Weeks
            </Button>
            
            <Card
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                color: 'white'
              }}
            >
              <CheckCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
              <Title level={2} style={{ color: 'white', margin: 0 }}>
                Review Created Successfully!
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '16px', margin: '8px 0 0 0' }}>
                Your review for <Text strong style={{ color: 'white' }}>{weekTitle}</Text> has been saved.
              </Paragraph>
            </Card>
          </div>

          <Card
            title={
              <Space>
                <EditOutlined />
                <span>Your Review</span>
                <Tag color="blue" icon={<CalendarOutlined />}>
                  Created: {formatDate(createdReview.created_at)}
                </Tag>
              </Space>
            }
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Title level={4} style={{ color: '#52c41a', marginBottom: '8px' }}>
                  What Went Well:
                </Title>
                <Paragraph style={{ background: '#f6ffed', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {createdReview.what_went_well}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <Title level={4} style={{ color: '#fa8c16', marginBottom: '8px' }}>
                  What Can Be Improved:
                </Title>
                <Paragraph style={{ background: '#fff7e6', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {createdReview.can_improve}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '8px' }}>
                  Action Plans:
                </Title>
                <Paragraph style={{ background: '#f0f9ff', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {createdReview.action_plans}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <Title level={4} style={{ color: '#722ed1', marginBottom: '8px' }}>
                  Summary:
                </Title>
                <Paragraph style={{ background: '#f9f0ff', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {createdReview.summary}
                </Paragraph>
              </div>
            </Space>
          </Card>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Button
                type="default"
                icon={<PlusOutlined />}
                onClick={handleAddAnother}
                size="large"
                block
              >
                Add Another Review
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToWeeks}
                size="large"
                block
                style={{ background: '#fadb14', borderColor: '#fadb14', color: '#000' }}
              >
                Back to Weeks
              </Button>
            </Col>
          </Row>
        </Space>
      </div>
    );
  }

  // Show form
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Spin spinning={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToWeeks}
              disabled={loading}
              style={{ marginBottom: '16px' }}
            >
              Back to Weeks
            </Button>
            
            <Card
              style={{
                background: 'linear-gradient(135deg, #fadb14 0%, #d4b106 100%)',
                border: 'none',
                textAlign: 'center'
              }}
            >
              <EditOutlined style={{ fontSize: '32px', marginBottom: '12px' }} />
              <Title level={2} style={{ margin: 0 }}>
                Add Review
              </Title>
              <Paragraph style={{ fontSize: '16px', margin: '8px 0 0 0' }}>
                Creating review for: <Text strong>{weekTitle}</Text>
              </Paragraph>
            </Card>
          </div>

          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          )}

          <Card
            title={
              <Space>
                <EditOutlined />
                <span>Review Form</span>
              </Space>
            }
            style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              disabled={loading}
              requiredMark={false}
            >
              <Form.Item
                name="whatWentWell"
                label={<Text strong style={{ color: '#52c41a' }}>What Went Well:</Text>}
                rules={[
                  { required: true, message: 'Please describe what went well' },
                  { whitespace: true, message: 'Please enter valid content' }
                ]}
              >
                <TextArea
                  placeholder="Describe what went well during this week..."
                  rows={4}
                  showCount
                  maxLength={1000}
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item
                name="canImprove"
                label={<Text strong style={{ color: '#fa8c16' }}>What Can Be Improved:</Text>}
                rules={[
                  { required: true, message: 'Please describe what can be improved' },
                  { whitespace: true, message: 'Please enter valid content' }
                ]}
              >
                <TextArea
                  placeholder="Describe areas that can be improved..."
                  rows={4}
                  showCount
                  maxLength={1000}
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item
                name="actionPlans"
                label={<Text strong style={{ color: '#1890ff' }}>Action Plans:</Text>}
                rules={[
                  { required: true, message: 'Please outline action plans' },
                  { whitespace: true, message: 'Please enter valid content' }
                ]}
              >
                <TextArea
                  placeholder="Outline specific action plans for improvement..."
                  rows={4}
                  showCount
                  maxLength={1000}
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item
                name="summary"
                label={<Text strong style={{ color: '#722ed1' }}>Summary:</Text>}
                rules={[
                  { required: true, message: 'Please provide a summary' },
                  { whitespace: true, message: 'Please enter valid content' }
                ]}
              >
                <TextArea
                  placeholder="Provide an overall summary of the week..."
                  rows={3}
                  showCount
                  maxLength={500}
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Button
                      type="default"
                      onClick={handleBackToWeeks}
                      disabled={loading}
                      size="large"
                      block
                    >
                      Cancel
                    </Button>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      block
                      style={{ background: '#fadb14', borderColor: '#fadb14', color: '#000' }}
                    >
                      {loading ? 'Creating Review...' : 'Create Review'}
                    </Button>
                  </Col>
                </Row>
              </Form.Item>
            </Form>
          </Card>
        </Space>
      </Spin>
    </div>
  );
};

export default AddReviewPage;