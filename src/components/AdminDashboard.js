import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

const AdminDashboard = () => {
  const [inventory, setInventory] = useState({});
  const [newItem, setNewItem] = useState({ id: '', stock: '', price: '', specs: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const token = await auth.currentUser.getIdToken();
      const response = await axios.get('http://localhost:5000/api/inventory', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
    } catch (err) {
      setError('Failed to fetch inventory');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.post(
        'http://localhost:5000/api/inventory',
        newItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewItem({ id: '', stock: '', price: '', specs: '' });
      fetchInventory();
    } catch (err) {
      setError('Failed to add item');
    }
  };

  const handleUpdateItem = async (id) => {
    const updatedItem = inventory[id];
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.put(
        `http://localhost:5000/api/inventory/${id}`,
        updatedItem,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchInventory();
    } catch (err) {
      setError('Failed to update item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      const token = await auth.currentUser.getIdToken();
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchInventory();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Inventory Dashboard</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <h3>Add New Item</h3>
      <form onSubmit={handleAddItem} className="admin-form">
        <input
          placeholder="Item ID"
          value={newItem.id}
          onChange={(e) => setNewItem({ ...newItem, id: e.target.value })}
          required
        />
        <input
          placeholder="Stock"
          type="number"
          value={newItem.stock}
          onChange={(e) => setNewItem({ ...newItem, stock: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          type="number"
          step="0.01"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          required
        />
        <input
          placeholder="Specs"
          value={newItem.specs}
          onChange={(e) => setNewItem({ ...newItem, specs: e.target.value })}
          required
        />
        <button type="submit">Add Item</button>
      </form>

      <h3>Inventory</h3>
      {error && <p className="error">{error}</p>}
      <table className="inventory-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Specs</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(inventory).map(([id, item]) => (
            <tr key={id}>
              <td>{id}</td>
              <td>
                <input
                  type="number"
                  value={item.stock}
                  onChange={(e) =>
                    setInventory({ ...inventory, [id]: { ...item, stock: e.target.value } })
                  }
                />
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) =>
                    setInventory({ ...inventory, [id]: { ...item, price: e.target.value } })
                  }
                />
              </td>
              <td>
                <input
                  value={item.specs}
                  onChange={(e) =>
                    setInventory({ ...inventory, [id]: { ...item, specs: e.target.value } })
                  }
                />
              </td>
              <td>
                <button onClick={() => handleUpdateItem(id)}>Update</button>
                <button onClick={() => handleDeleteItem(id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;