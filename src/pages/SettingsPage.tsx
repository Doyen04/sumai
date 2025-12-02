import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Button,
    Select,
    Switch,
    Slider,
    Alert,
    ConfirmModal,
} from '@/components/ui';
import { SUMMARY_LENGTH_OPTIONS, EXPORT_FORMAT_OPTIONS, TEXT_SIZE_OPTIONS, LINE_SPACING_OPTIONS } from '@/constants';
import { useTheme } from '@/contexts';
import type { UserSettings, SummaryLength, ExportFormat } from '@/types';

export function SettingsPage() {
    const { theme, setTheme } = useTheme();

    const [settings, setSettings] = useState<UserSettings>({
        defaultSummaryLength: 'balanced',
        defaultExportFormat: 'pdf',
        highlightIntensity: 70,
        theme: theme,
        textSize: 'medium',
        lineSpacing: 'normal',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 500));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearData = async () => {
        try {
            setIsClearing(true);
            // Simulate clearing data
            await new Promise((resolve) => setTimeout(resolve, 500));
            setShowClearConfirm(false);
        } finally {
            setIsClearing(false);
        }
    };

    const updateSetting = <K extends keyof UserSettings>(
        key: K,
        value: UserSettings[K]
    ) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-heading-1">Settings</h1>
                <p className="text-muted mt-1">
                    Customize your summarization preferences
                </p>
            </div>

            {/* Success Alert */}
            {showSuccess && (
                <Alert variant="success" onClose={() => setShowSuccess(false)}>
                    Settings saved successfully
                </Alert>
            )}

            {/* Summary Preferences */}
            <Card>
                <CardHeader>
                    <CardTitle>Summary Preferences</CardTitle>
                    <CardDescription>
                        Configure default settings for document summarization
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Select
                        label="Default Summary Length"
                        options={SUMMARY_LENGTH_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                            description: opt.description,
                        }))}
                        value={settings.defaultSummaryLength}
                        onChange={(value) =>
                            updateSetting('defaultSummaryLength', value as SummaryLength)
                        }
                    />

                    <Select
                        label="Default Export Format"
                        options={EXPORT_FORMAT_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                        value={settings.defaultExportFormat}
                        onChange={(value) =>
                            updateSetting('defaultExportFormat', value as ExportFormat)
                        }
                    />

                    <Slider
                        label="Highlight Intensity"
                        value={settings.highlightIntensity}
                        onChange={(value) => updateSetting('highlightIntensity', value)}
                        min={0}
                        max={100}
                        step={10}
                    />
                </CardContent>
            </Card>

            {/* Accessibility */}
            <Card>
                <CardHeader>
                    <CardTitle>Accessibility</CardTitle>
                    <CardDescription>
                        Adjust display settings for better readability
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Select
                        label="Text Size"
                        options={TEXT_SIZE_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                        value={settings.textSize}
                        onChange={(value) =>
                            updateSetting('textSize', value as UserSettings['textSize'])
                        }
                    />

                    <Select
                        label="Line Spacing"
                        options={LINE_SPACING_OPTIONS.map((opt) => ({
                            value: opt.value,
                            label: opt.label,
                        }))}
                        value={settings.lineSpacing}
                        onChange={(value) =>
                            updateSetting('lineSpacing', value as UserSettings['lineSpacing'])
                        }
                    />

                    <div className="pt-2">
                        <Switch
                            checked={theme === 'dark'}
                            onChange={(checked) => {
                                const newTheme = checked ? 'dark' : 'light';
                                setTheme(newTheme);
                                updateSetting('theme', newTheme);
                            }}
                            label="Dark Mode"
                            description="Use dark theme for reduced eye strain"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                        Manage your documents and usage data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Clear All Documents
                            </p>
                            <p className="text-sm text-muted">
                                Delete all uploaded documents and summaries
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setShowClearConfirm(true)}
                            leftIcon={<Trash2 className="w-4 h-4" />}
                        >
                            Clear Data
                        </Button>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-sm font-medium text-foreground">
                                Export Usage History
                            </p>
                            <p className="text-sm text-muted">
                                Download a record of your activity
                            </p>
                        </div>
                        <Button variant="secondary" size="sm">
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    leftIcon={<Save className="w-4 h-4" />}
                >
                    Save Settings
                </Button>
            </div>

            {/* Clear Data Confirmation */}
            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={() => setShowClearConfirm(false)}
                onConfirm={handleClearData}
                title="Clear All Data"
                message="Are you sure you want to delete all documents and summaries? This action cannot be undone."
                confirmLabel="Clear All"
                variant="danger"
                isLoading={isClearing}
            />
        </div>
    );
}
