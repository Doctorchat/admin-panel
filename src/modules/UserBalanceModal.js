import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Radio, message } from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import api from '../utils/appApi';

const { Text } = Typography;

/**
 * Modal for managing a user's wallet balance
 */
function UserBalanceModal({ visible, onClose, user, onSuccess }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [operationType, setOperationType] = useState('add');

  const handleFinish = async (values) => {
    try {
      setLoading(true);
      
      // Convert amount based on operation type
      const amount = operationType === 'subtract' 
        ? -Math.abs(parseFloat(values.amount)) 
        : Math.abs(parseFloat(values.amount));
      
      // Use user ID and wallet ID
      await api.wallet.updateBalance({
        id: user.id,
        wallet_id: user.wallet?.id,
        amount: amount
      });
      
      message.success(`Balanța a fost ${operationType === 'add' ? 'mărită' : 'redusă'} cu succes!`);
      
      if (onSuccess) {
        onSuccess();
      }
      
      form.resetFields();
      onClose();
    } catch (error) {
      console.error('Failed to update balance:', error);
      message.error('A apărut o eroare la actualizarea balanței');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Modal
      title="Gestionează balanța utilizatorului"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <div className="balance-info" style={{ marginBottom: 20 }}>
        <Text>Utilizator: <strong>{user?.name}</strong></Text>
        <br />
        <Text>ID: <strong>{user?.id}</strong></Text>
        <br />
        <Text>ID Portofel: <strong>{user?.wallet?.id}</strong></Text>
        <br />
        <Text>Balanța curentă: <strong>{user?.wallet?.balance || 0} MDL</strong></Text>
        {user?.wallet?.frozen > 0 && (
          <>
            <br />
            <Text>Balanță blocată: <strong className="text-warning">{user?.wallet?.frozen} MDL</strong></Text>
          </>
        )}
      </div>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ 
          operationType: 'add',
          amount: ''
        }}
      >
        <Form.Item
          name="operationType"
          label="Operație"
        >
          <Radio.Group 
            onChange={(e) => setOperationType(e.target.value)}
            value={operationType}
          >
            <Radio.Button value="add">Adaugă fonduri</Radio.Button>
            <Radio.Button value="subtract">Retrage fonduri</Radio.Button>
          </Radio.Group>
        </Form.Item>
        
        <Form.Item
          name="amount"
          label="Sumă (MDL)"
          rules={[
            { required: true, message: 'Te rugăm să introduci suma' },
            { pattern: /^[0-9]+(\.[0-9]{1,2})?$/, message: 'Te rugăm să introduci un număr valid' }
          ]}
        >
          <Input 
            prefix={<DollarOutlined />} 
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </Form.Item>
        
        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button onClick={onClose}>
              Anulează
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {operationType === 'add' ? 'Adaugă' : 'Retrage'} fonduri
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default UserBalanceModal;