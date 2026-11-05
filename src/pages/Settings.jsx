import React, { useState } from 'react';
import PageHeader from '../components/layout/PageHeader';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useNotificationContext } from '../context/NotificationContext';

export default function Settings() {
  const { addToast } = useNotificationContext();
  const [profile, setProfile] = useState({
    name: 'Jordan Lee',
    email: 'jordan.lee@supportdesk.internal',
    department: 'Customer Engineering',
    emailAlerts: true,
    autoAssign: true
  });

  const handleSave = (e) => {
    e.preventDefault();
    addToast('Settings successfully updated', 'success');
  };

  return (
    <div className="settings-page">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Manage agent account profile, notification preferences, and desk rules."
      />

      <div className="settings-card">
        <h3>Agent Profile</h3>
        <form onSubmit={handleSave}>
          <div className="form-grid-2">
            <Input
              label="Full Name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
            <Input
              label="Work Email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <Input
            label="Department"
            value={profile.department}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
          />

          <h3 style={{ marginTop: '2rem' }}>Notification Preferences</h3>
          <div className="settings-checkbox-group">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={profile.emailAlerts}
                onChange={(e) => setProfile({ ...profile, emailAlerts: e.target.checked })}
              />
              <span>Send instant email alerts when new tickets are assigned</span>
            </label>
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={profile.autoAssign}
                onChange={(e) => setProfile({ ...profile, autoAssign: e.target.checked })}
              />
              <span>Participate in Round-Robin auto assignment</span>
            </label>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Button variant="primary" type="submit">
              Save Preferences
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
