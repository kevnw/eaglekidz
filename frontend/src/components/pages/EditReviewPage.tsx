import React, { useState, useEffect } from 'react';
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
  SaveOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { apiService, UpdateReviewRequest, Review } from '../../services/api';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

interface LocationState {
  weekTitle?: string;
  review?: Review;
}

const EditReviewPage: React.FC = () => {
  const { weekId, reviewId } = useParams<{ weekId: string; reviewId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const [form] = Form.useForm();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedReview, setUpdatedReview] = useState<Review | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const weekTitle = state?.weekTitle || `Week ${weekId}`;

  useEffect(() => {
    // If review data is passed via state, use it
    if (state?.review) {
      const review = state.review;
      form.setFieldsValue({
        whatWentWell: review.what_went_well,
        canImprove: review.can_improve,
        actionPlans: review.action_plans,
        summary: review.summary
      });
      setInitialLoading(false);
    } else {
      // Otherwise, fetch the review data
      fetchReview();
    }
  }, [reviewId, state, form]);

  const fetchReview = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      if (!reviewId) {
        throw new Error('Review ID is missing');
      }
      
      const response = await apiService.getReviewById(reviewId);
      
      if (response.data) {
        const review = response.data;
        form.setFieldsValue({
          whatWentWell: review.what_went_well,
          canImprove: review.can_improve,
          actionPlans: review.action_plans,
          summary: review.summary
        });
      } else {
        throw new Error('Review not found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load review. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    if (!reviewId) {
      const errorMessage = 'Review ID is missing';
      setError(errorMessage);
      message.error(errorMessage);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updateData: UpdateReviewRequest = {
        what_went_well: values.whatWentWell.trim(),
        can_improve: values.canImprove.trim(),
        action_plans: values.actionPlans.trim(),
        summary: values.summary.trim()
      };

      const response = await apiService.updateReview(reviewId, updateData);
      
      if (response.data) {
        setUpdatedReview(response.data);
        message.success('Review updated successfully!');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update review. Please try again.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToReviews = () => {
    navigate(`/weeks/${weekId}/reviews`, {
      state: { weekTitle }
    });
  };

  const handleBackToWeeks = () => {
    navigate('/weeks');
  };

  const handleAiSummarize = async () => {
    const whatWentWell = form.getFieldValue('whatWentWell');
    const canImprove = form.getFieldValue('canImprove');
    const actionPlans = form.getFieldValue('actionPlans');
    
    if (!whatWentWell || !canImprove) {
      message.warning('Please fill in "What Went Well" and "What Can Be Improved" fields first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/ai/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          what_went_well: whatWentWell,
          can_improve: canImprove,
          action_plans: actionPlans || '',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && data.data.summary) {
        form.setFieldsValue({ summary: data.data.summary });
        message.success('AI summary generated successfully!');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('AI summarization error:', err);
      message.error('Failed to generate AI summary. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM D, YYYY [at] h:mm A');
  };

  // Show loading state
  if (initialLoading) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToReviews}
              style={{ marginBottom: '16px' }}
            >
              Back to Reviews
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
                Edit Review
              </Title>
              <Paragraph style={{ fontSize: '16px', margin: '8px 0 0 0' }}>
                Loading review for: <Text strong>{weekTitle}</Text>
              </Paragraph>
            </Card>
          </div>

          <Card style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <Paragraph style={{ marginTop: '16px', fontSize: '16px' }}>
              Loading review...
            </Paragraph>
          </Card>
        </Space>
      </div>
    );
  }

  // Show updated review
  if (updatedReview) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToReviews}
              style={{ marginBottom: '16px' }}
            >
              Back to Reviews
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
                Review Updated Successfully!
              </Title>
              <Paragraph style={{ color: 'white', fontSize: '16px', margin: '8px 0 0 0' }}>
                Your review for <Text strong style={{ color: 'white' }}>{weekTitle}</Text> has been updated.
              </Paragraph>
            </Card>
          </div>

          <Card
            title={
              <Space>
                <EditOutlined />
                <span>Updated Review</span>
                <Tag color="green" icon={<CalendarOutlined />}>
                  Updated: {formatDate(updatedReview.updated_at)}
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
                  {updatedReview.what_went_well}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <Title level={4} style={{ color: '#fa8c16', marginBottom: '8px' }}>
                  What Can Be Improved:
                </Title>
                <Paragraph style={{ background: '#fff7e6', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {updatedReview.can_improve}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <Title level={4} style={{ color: '#1890ff', marginBottom: '8px' }}>
                  Action Plans:
                </Title>
                <Paragraph style={{ background: '#f0f9ff', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {updatedReview.action_plans}
                </Paragraph>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div>
                <Title level={4} style={{ color: '#722ed1', marginBottom: '8px' }}>
                  Summary:
                </Title>
                <Paragraph style={{ background: '#f9f0ff', padding: '12px', borderRadius: '6px', margin: 0 }}>
                  {updatedReview.summary}
                </Paragraph>
              </div>
            </Space>
          </Card>

          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Button
                type="primary"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToReviews}
                size="large"
                block
                style={{ background: '#fadb14', borderColor: '#fadb14', color: '#000' }}
              >
                Back to Reviews
              </Button>
            </Col>
            <Col xs={24} sm={12}>
              <Button
                type="default"
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToWeeks}
                size="large"
                block
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
              onClick={handleBackToReviews}
              disabled={loading}
              style={{ marginBottom: '16px' }}
            >
              Back to Reviews
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
                Edit Review
              </Title>
              <Paragraph style={{ fontSize: '16px', margin: '8px 0 0 0' }}>
                Editing review for: <Text strong>{weekTitle}</Text>
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
                <span>Edit Review Form</span>
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
                  maxLength={1000}
                  rows={4}
                  showCount
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
                  maxLength={1000}
                  rows={4}
                  showCount
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
                  maxLength={1000}
                  rows={4}
                  showCount
                />
              </Form.Item>

              <Form.Item
                name="summary"
                label={
                  <Space>
                    <Text strong style={{ color: '#722ed1' }}>Summary:</Text>
                    <Button
                      type="link"
                      size="small"
                      icon={<RobotOutlined />}
                      loading={aiLoading}
                      onClick={handleAiSummarize}
                      style={{ padding: 0, height: 'auto' }}
                    >
                      AI Summarize
                    </Button>
                  </Space>
                }
                rules={[
                  { required: true, message: 'Please provide a summary' },
                  { whitespace: true, message: 'Please enter valid content' }
                ]}
              >
                <TextArea
                  placeholder="Provide an overall summary of the week..."
                  maxLength={500}
                  rows={3}
                  showCount
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Button
                      type="default"
                      onClick={handleBackToReviews}
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
                      icon={<SaveOutlined />}
                      style={{ background: '#fadb14', borderColor: '#fadb14', color: '#000' }}
                    >
                      {loading ? 'Updating...' : 'Update Review'}
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

export default EditReviewPage;