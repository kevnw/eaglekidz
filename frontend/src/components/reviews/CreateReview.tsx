import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin, Space, Row, Col, message } from 'antd';
import { CheckCircleOutlined, EditOutlined, CloseOutlined } from '@ant-design/icons';
import { apiService, CreateReviewRequest } from '../../services/api';
import TipTapEditor from '../TipTapEditor';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface CreateReviewProps {
  weekId: string;
  weekTitle: string;
  onReviewCreated?: () => void;
  onClose?: () => void;
}

const CreateReview: React.FC<CreateReviewProps> = ({ 
  weekId, 
  weekTitle, 
  onReviewCreated, 
  onClose 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const reviewData: CreateReviewRequest = {
        week_id: weekId,
        what_went_well: values.whatWentWell?.trim() || '',
        can_improve: values.canImprove?.trim() || '',
        action_plans: values.actionPlans?.trim() || '',
        summary: values.summary?.trim() || '',
      };

      const response = await apiService.createReview(reviewData);
      
      if (response.data) {
        setSuccess('Review created successfully!');
        message.success('Review created successfully!');
        
        // Reset form
        form.resetFields();
        
        if (onReviewCreated) {
          onReviewCreated();
        }
        
        // Close the form after a short delay
        setTimeout(() => {
          if (onClose) {
            onClose();
          }
        }, 1500);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        message.error(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
        message.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card
        style={{
          maxWidth: 600,
          margin: '0 auto',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <CheckCircleOutlined 
            style={{ 
              fontSize: 48, 
              color: '#52c41a', 
              marginBottom: 16 
            }} 
          />
          <Title level={3} style={{ color: '#52c41a', marginBottom: 8 }}>
            Review Created Successfully!
          </Title>
          <Text type="secondary">
            Your review for {weekTitle} has been saved.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Spin spinning={loading}>
      <Card
        title={
          <Space>
            <EditOutlined />
            <span>Add Review</span>
          </Space>
        }
        extra={
          onClose && (
            <Button 
              type="text" 
              icon={<CloseOutlined />} 
              onClick={onClose}
              disabled={loading}
            />
          )
        }
        style={{
          maxWidth: 800,
          margin: '0 auto',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message={`Creating review for: ${weekTitle}`}
            type="info"
            showIcon
            style={{ borderRadius: 8 }}
          />
          
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ borderRadius: 8 }}
            />
          )}

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={loading}
            size="large"
          >
            <Form.Item
              name="whatWentWell"
              label="What Went Well"
              rules={[
                { required: true, message: 'Please describe what went well!' },
                { min: 10, message: 'Please provide at least 10 characters!' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe what went well during this week..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="canImprove"
              label="What Can Be Improved"
              rules={[
                { required: true, message: 'Please describe what can be improved!' },
                { min: 10, message: 'Please provide at least 10 characters!' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe areas that can be improved..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="actionPlans"
              label="Action Plans"
              rules={[
                { required: true, message: 'Please outline action plans!' },
                { min: 10, message: 'Please provide at least 10 characters!' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Outline specific action plans for improvement..."
                style={{ borderRadius: 8 }}
              />
            </Form.Item>

            <Form.Item
              name="summary"
              label="Summary"
            >
              <TipTapEditor
                placeholder="Provide an overall summary of the week..."
                height="120px"
              />
            </Form.Item>

            <Form.Item>
              <Row gutter={16}>
                {onClose && (
                  <Col>
                    <Button
                      size="large"
                      onClick={onClose}
                      disabled={loading}
                      style={{ borderRadius: 8 }}
                    >
                      Cancel
                    </Button>
                  </Col>
                )}
                <Col>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<CheckCircleOutlined />}
                    style={{ 
                      borderRadius: 8,
                      background: '#1890ff',
                      borderColor: '#1890ff'
                    }}
                  >
                    {loading ? 'Creating Review...' : 'Create Review'}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </Spin>
  );
};

export default CreateReview;