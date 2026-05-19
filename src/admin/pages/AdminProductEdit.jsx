import React from 'react';
import { useParams } from 'react-router-dom';
import AdminProductForm from './AdminProductForm';

const AdminProductEdit = () => {
  const { id } = useParams();
  return <AdminProductForm productId={id} />;
};

export default AdminProductEdit;
