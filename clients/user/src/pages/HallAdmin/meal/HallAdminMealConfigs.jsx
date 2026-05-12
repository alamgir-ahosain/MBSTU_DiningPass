import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { hallAdminAPI } from '../../../services/api';
import '../HallAdminPages.css';

const getItems = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.content)) return payload.content;
    return [];
};

const createDefaultForm = () => ({
    mealDate: '',
    mealType: 'LUNCH',
    mealMenu: '',
    mealPrice: '',
    cutTokenBefore: '23:59',
    tokenExpires: '14:30',
    feastNote: '',
});

export const HallAdminMealConfigs = () => {
    const [configs, setConfigs] = useState([]);
    const [createForm, setCreateForm] = useState(createDefaultForm());
    const [editingId, setEditingId] = useState('');
    const [updateForm, setUpdateForm] = useState({
        mealMenu: '',
        mealPrice: '',
        cutTokenBefore: '',
        tokenExpires: '',
        isActive: true,
        feastNote: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const editableConfig = useMemo(
        () => configs.find((item) => item.id === editingId),
        [configs, editingId],
    );

    const loadConfigs = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await hallAdminAPI.getMealConfigs();
            setConfigs(getItems(response.data));
        } catch (err) {
            console.error('Failed to load meal configs', err);
            setError('Failed to load meal configurations. ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadConfigs();
    }, []);

    const handleCreateChange = (event) => {
        const { name, value } = event.target;
        setCreateForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdateChange = (event) => {
        const { name, value, type, checked } = event.target;
        setUpdateForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleCreate = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await hallAdminAPI.createMealConfig({
                ...createForm,
                mealPrice: Number(createForm.mealPrice),
            });
            setSuccess('Meal configuration created successfully.');
            setCreateForm(createDefaultForm());
            await loadConfigs();
        } catch (err) {
            console.error('Failed to create meal config', err);
            setError('Failed to create meal configuration. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    const prepareEdit = (config) => {
        setEditingId(config.id);
        setUpdateForm({
            mealMenu: config.mealMenu || '',
            mealPrice: config.mealPrice || '',
            cutTokenBefore: config.cutTokenBefore || '',
            tokenExpires: config.tokenExpires || '',
            isActive: typeof config.isActive === 'boolean' ? config.isActive : true,
            feastNote: config.feastNote || '',
        });
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        if (!editingId) return;

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            await hallAdminAPI.updateMealConfig(editingId, {
                ...updateForm,
                mealPrice: Number(updateForm.mealPrice),
            });
            setSuccess('Meal configuration updated successfully.');
            setEditingId('');
            await loadConfigs();
        } catch (err) {
            console.error('Failed to update meal config', err);
            setError('Failed to update meal configuration. ' + (err.response?.data?.message || err.message));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-wrapper">
            <Link to="/hallAdmin/dashboard" className="back-link">← Back to Dashboard</Link>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <h1 className="page-title">Meal Config</h1>
                <p className="detail-subtitle">Create, get all, and update meal configurations.</p>

                {error && <div className="message error">{error}</div>}
                {success && <div className="message success">{success}</div>}

                <form onSubmit={handleCreate}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="mealDate">Meal Date</label>
                            <input id="mealDate" type="date" name="mealDate" value={createForm.mealDate} onChange={handleCreateChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mealType">Meal Type</label>
                            <select id="mealType" name="mealType" value={createForm.mealType} onChange={handleCreateChange}>
                                <option value="LUNCH">LUNCH</option>
                                <option value="DINNER">DINNER</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="mealMenu">Meal Menu</label>
                            <input id="mealMenu" name="mealMenu" value={createForm.mealMenu} onChange={handleCreateChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mealPrice">Meal Price</label>
                            <input id="mealPrice" type="number" min="0" name="mealPrice" value={createForm.mealPrice} onChange={handleCreateChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cutTokenBefore">Cut Token Before</label>
                            <input id="cutTokenBefore" type="time" name="cutTokenBefore" value={createForm.cutTokenBefore} onChange={handleCreateChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="tokenExpires">Token Expires</label>
                            <input id="tokenExpires" type="time" name="tokenExpires" value={createForm.tokenExpires} onChange={handleCreateChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="feastNote">Feast Note (Optional)</label>
                            <input id="feastNote" name="feastNote" value={createForm.feastNote} onChange={handleCreateChange} />
                        </div>
                    </div>
                    <div className="button-group">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Create Meal Config'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>All Meal Configs</h2>

                {loading ? (
                    <div className="empty-state"><p>Loading meal configurations...</p></div>
                ) : configs.length === 0 ? (
                    <div className="empty-state">
                        <h3>No meal configurations found</h3>
                        <p>Create one using the form above.</p>
                    </div>
                ) : (
                    <div className="meal-config-grid">
                        {configs.map((config) => (
                            <div key={config.id} className="meal-config-card">
                                <div className="meal-config-card-header">
                                    <h3>{config.mealType || '-'}</h3>
                                    <span className={`badge ${config.isActive ? 'badge-active' : 'badge-inactive'}`}>
                                        {config.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <p className="meal-config-card-date">{config.mealDate || '-'}</p>

                                <div className="meal-config-details">
                                    <p><strong>Menu:</strong> {config.mealMenu || '-'}</p>
                                    <p><strong>Price:</strong> {config.mealPrice ?? '-'}</p>
                                    <p><strong>Cut Before:</strong> {config.cutTokenBefore || '-'}</p>
                                    <p><strong>Expires:</strong> {config.tokenExpires || '-'}</p>
                                    <p><strong>Feast Note:</strong> {config.feastNote || '-'}</p>
                                </div>

                                <div className="meal-config-card-actions">
                                    <button type="button" className="btn-small btn-edit" onClick={() => prepareEdit(config)}>
                                        Edit
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {editingId && editableConfig && (
                <div className="card">
                    <h2 style={{ marginTop: 0 }}>Update Meal Config</h2>
                    <p className="detail-subtitle">Editing {editableConfig.mealDate} ({editableConfig.mealType})</p>
                    <form onSubmit={handleUpdate}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="updateMealMenu">Meal Menu</label>
                                <input id="updateMealMenu" name="mealMenu" value={updateForm.mealMenu} onChange={handleUpdateChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="updateMealPrice">Meal Price</label>
                                <input id="updateMealPrice" type="number" min="0" name="mealPrice" value={updateForm.mealPrice} onChange={handleUpdateChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="updateCutTokenBefore">Cut Token Before</label>
                                <input id="updateCutTokenBefore" type="time" name="cutTokenBefore" value={updateForm.cutTokenBefore} onChange={handleUpdateChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="updateTokenExpires">Token Expires</label>
                                <input id="updateTokenExpires" type="time" name="tokenExpires" value={updateForm.tokenExpires} onChange={handleUpdateChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="updateFeastNote">Feast Note</label>
                                <input id="updateFeastNote" name="feastNote" value={updateForm.feastNote} onChange={handleUpdateChange} />
                            </div>
                            <div className="form-group">
                                <label htmlFor="updateIsActive">Booking Active</label>
                                <input id="updateIsActive" type="checkbox" name="isActive" checked={updateForm.isActive} onChange={handleUpdateChange} />
                            </div>
                        </div>
                        <div className="button-group">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? 'Updating...' : 'Update Meal Config'}
                            </button>
                            <button type="button" className="btn btn-cancel" onClick={() => setEditingId('')}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

