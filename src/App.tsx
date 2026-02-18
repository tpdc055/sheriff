import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SignaturePad, type SignaturePadRef } from '@/components/signature-pad';
import { mockWrits, currentOfficer } from './mock-data';
import type { Writ, ServiceAttempt, SeizureItem } from './types';
import { getCurrentPosition, formatCoordinates, getGoogleMapsLink } from './utils/gps';
import { saveWrits, loadWrits, updateWrit, getOfflineQueue, isOnline, getLastSyncTime } from './utils/storage';
import { compressImage, validateImageFile } from './utils/photo';

function App() {
  const [activeView, setActiveView] = useState<'dashboard' | 'writs' | 'profile'>('dashboard');
  const [selectedWrit, setSelectedWrit] = useState<Writ | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [writs, setWrits] = useState<Writ[]>([]);
  const [online, setOnline] = useState(isOnline());
  const [gpsLoading, setGpsLoading] = useState(false);

  // Service attempt form state
  const [serviceOutcome, setServiceOutcome] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [serviceGPS, setServiceGPS] = useState('');
  const [serviceSignature, setServiceSignature] = useState('');
  const [showSignatureDialog, setShowSignatureDialog] = useState(false);
  const signaturePadRef = useRef<SignaturePadRef>(null);

  // Seizure form state
  const [seizureDescription, setSeizureDescription] = useState('');
  const [seizureValue, setSeizureValue] = useState('');
  const [seizureCondition, setSeizureCondition] = useState('');
  const [seizureStorageLocation, setSeizureStorageLocation] = useState('');
  const [seizurePhotos, setSeizurePhotos] = useState<string[]>([]);
  const [seizureGPS, setSeizureGPS] = useState('');

  // Initialize app with offline data
  useEffect(() => {
    const savedWrits = loadWrits();
    if (savedWrits) {
      setWrits(savedWrits);
    } else {
      setWrits(mockWrits);
      saveWrits(mockWrits);
    }

    // Listen for online/offline events
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-save writs when they change
  useEffect(() => {
    if (writs.length > 0) {
      saveWrits(writs);
    }
  }, [writs]);

  const filteredWrits = writs.filter(writ => {
    const matchesSearch = writ.writNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      writ.caseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      writ.targetParty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || writ.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: writs.length,
    pending: writs.filter(w => w.status === 'pending').length,
    inProgress: writs.filter(w => w.status === 'in_progress').length,
    executed: writs.filter(w => w.status === 'executed').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500';
      case 'in_progress': return 'bg-blue-500';
      case 'executed': return 'bg-emerald-500';
      case 'closed': return 'bg-gray-500';
      case 'stayed': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getWritTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return `KES ${amount.toLocaleString()}`;
  };

  const handleGetGPS = async (type: 'service' | 'seizure') => {
    setGpsLoading(true);
    try {
      const coords = await getCurrentPosition();
      const formatted = formatCoordinates(coords);
      if (type === 'service') {
        setServiceGPS(formatted);
      } else {
        setSeizureGPS(formatted);
      }
    } catch (error) {
      alert(`GPS Error: ${error instanceof Error ? error.message : 'Could not get location'}`);
    } finally {
      setGpsLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validateImageFile(file)) {
        alert(`Invalid file: ${file.name}. Must be JPEG/PNG and under 10MB`);
        continue;
      }

      try {
        const compressed = await compressImage(file);
        newPhotos.push(compressed);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }

    setSeizurePhotos([...seizurePhotos, ...newPhotos]);
  };

  const handleRemovePhoto = (index: number) => {
    setSeizurePhotos(seizurePhotos.filter((_, i) => i !== index));
  };

  const handleSaveSignature = (signature: string) => {
    setServiceSignature(signature);
    setShowSignatureDialog(false);
  };

  const handleLogService = () => {
    if (!selectedWrit) return;

    if (!serviceOutcome || !serviceLocation || !serviceNotes) {
      alert('Please fill in all required fields');
      return;
    }

    const newAttempt: ServiceAttempt = {
      id: `sa-${Date.now()}`,
      writId: selectedWrit.id,
      date: new Date().toISOString().split('T')[0],
      officer: currentOfficer.name,
      outcome: serviceOutcome as ServiceAttempt['outcome'],
      notes: serviceNotes,
      location: serviceLocation,
      gpsCoordinates: serviceGPS || undefined,
      signature: serviceSignature || undefined,
      timestamp: Date.now(),
    };

    const updatedWrit = {
      ...selectedWrit,
      serviceAttempts: [...selectedWrit.serviceAttempts, newAttempt],
      lastModified: Date.now(),
    };

    const updatedWrits = writs.map(w => w.id === selectedWrit.id ? updatedWrit : w);
    setWrits(updatedWrits);
    setSelectedWrit(updatedWrit);

    // Reset form
    setServiceOutcome('');
    setServiceNotes('');
    setServiceLocation('');
    setServiceGPS('');
    setServiceSignature('');

    alert('Service attempt logged successfully!' + (online ? '' : ' (Will sync when online)'));
  };

  const handleRecordSeizure = () => {
    if (!selectedWrit) return;

    if (!seizureDescription || !seizureValue || !seizureCondition || !seizureStorageLocation) {
      alert('Please fill in all required fields');
      return;
    }

    const newSeizure: SeizureItem = {
      id: `sz-${Date.now()}`,
      writId: selectedWrit.id,
      description: seizureDescription,
      estimatedValue: Number.parseFloat(seizureValue),
      condition: seizureCondition,
      location: seizureStorageLocation,
      status: 'seized',
      seizedDate: new Date().toISOString().split('T')[0],
      photos: seizurePhotos.length > 0 ? seizurePhotos : undefined,
      gpsCoordinates: seizureGPS || undefined,
      timestamp: Date.now(),
    };

    const updatedWrit = {
      ...selectedWrit,
      seizureItems: [...selectedWrit.seizureItems, newSeizure],
      lastModified: Date.now(),
    };

    const updatedWrits = writs.map(w => w.id === selectedWrit.id ? updatedWrit : w);
    setWrits(updatedWrits);
    setSelectedWrit(updatedWrit);

    // Reset form
    setSeizureDescription('');
    setSeizureValue('');
    setSeizureCondition('');
    setSeizureStorageLocation('');
    setSeizurePhotos([]);
    setSeizureGPS('');

    alert('Seizure recorded successfully!' + (online ? '' : ' (Will sync when online)'));
  };

  const lastSync = getLastSyncTime();
  const pendingSync = getOfflineQueue().filter(q => !q.synced).length;

  if (selectedWrit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4 sticky top-0 z-10 shadow-lg">
          <button onClick={() => setSelectedWrit(null)} className="mb-2 flex items-center gap-2 text-amber-100 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Writs
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-bold">{selectedWrit.writNumber}</h1>
              <p className="text-sm text-amber-100">{selectedWrit.caseNumber}</p>
            </div>
            <div className="flex items-center gap-2">
              {!online && (
                <Badge variant="destructive" className="text-xs">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                  </svg>
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Status Banner */}
            <Card className="border-2 border-amber-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={getPriorityColor(selectedWrit.priority)} className="text-xs">
                    {selectedWrit.priority.toUpperCase()}
                  </Badge>
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(selectedWrit.status)}`}>
                      {selectedWrit.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Type:</span>
                    <span className="font-medium">{getWritTypeLabel(selectedWrit.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Issued:</span>
                    <span className="font-medium">{formatDate(selectedWrit.issuedDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Expires:</span>
                    <span className="font-medium text-red-600">{formatDate(selectedWrit.expiryDate)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-amber-100">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="service">Service</TabsTrigger>
                <TabsTrigger value="seizures">Seizures</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Target Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <p className="text-stone-600 mb-1">Party:</p>
                      <p className="font-medium">{selectedWrit.targetParty}</p>
                    </div>
                    <div>
                      <p className="text-stone-600 mb-1">Address:</p>
                      <p className="font-medium">{selectedWrit.targetAddress}</p>
                    </div>
                    <div>
                      <p className="text-stone-600 mb-1">Instructions:</p>
                      <p className="font-medium leading-relaxed">{selectedWrit.instructions}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Service Tab */}
              <TabsContent value="service" className="space-y-4">
                {selectedWrit.serviceAttempts.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Service History ({selectedWrit.serviceAttempts.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedWrit.serviceAttempts.map((attempt) => (
                        <div key={attempt.id} className="border-l-4 border-amber-500 pl-3 py-2 bg-amber-50/50 rounded-r">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs text-stone-600">{formatDate(attempt.date)}</p>
                            <Badge variant={attempt.outcome === 'served' ? 'default' : 'secondary'} className="text-xs">
                              {attempt.outcome.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium mb-1">{attempt.location}</p>
                          <p className="text-sm text-stone-700">{attempt.notes}</p>
                          {attempt.gpsCoordinates && (
                            <a
                              href={getGoogleMapsLink(attempt.gpsCoordinates)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              View GPS: {attempt.gpsCoordinates}
                            </a>
                          )}
                          {attempt.witnessName && (
                            <p className="text-xs text-stone-600 mt-2">Witness: {attempt.witnessName}</p>
                          )}
                          {attempt.signature && (
                            <div className="mt-2 border rounded p-2 bg-white">
                              <p className="text-xs text-stone-600 mb-1">Signature:</p>
                              <img src={attempt.signature} alt="Signature" className="h-16 border" />
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Log Service Attempt */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Log New Service Attempt</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Outcome *</label>
                      <Select value={serviceOutcome} onValueChange={setServiceOutcome}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select outcome" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="served">Served</SelectItem>
                          <SelectItem value="refused">Refused</SelectItem>
                          <SelectItem value="not_found">Not Found</SelectItem>
                          <SelectItem value="address_incorrect">Address Incorrect</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Location *</label>
                      <div className="flex gap-2">
                        <Input
                          value={serviceLocation}
                          onChange={(e) => setServiceLocation(e.target.value)}
                          placeholder="Enter location"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleGetGPS('service')}
                          variant="outline"
                          disabled={gpsLoading}
                          className="shrink-0"
                        >
                          {gpsLoading ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          )}
                        </Button>
                      </div>
                      {serviceGPS && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          GPS: {serviceGPS}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Notes *</label>
                      <Textarea
                        value={serviceNotes}
                        onChange={(e) => setServiceNotes(e.target.value)}
                        placeholder="Describe what happened..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Signature (Optional)</label>
                      <Dialog open={showSignatureDialog} onOpenChange={setShowSignatureDialog}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            {serviceSignature ? 'Update Signature' : 'Capture Signature'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm">
                          <DialogHeader>
                            <DialogTitle>Capture Signature</DialogTitle>
                            <DialogDescription>
                              Have the party sign below to acknowledge service
                            </DialogDescription>
                          </DialogHeader>
                          <SignaturePad ref={signaturePadRef} onSave={handleSaveSignature} />
                        </DialogContent>
                      </Dialog>
                      {serviceSignature && (
                        <div className="mt-2 border rounded p-2 bg-white">
                          <img src={serviceSignature} alt="Signature" className="h-20 mx-auto" />
                        </div>
                      )}
                    </div>
                    <Button onClick={handleLogService} className="w-full bg-amber-700 hover:bg-amber-800">
                      Log Service Attempt
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Seizures Tab */}
              <TabsContent value="seizures" className="space-y-4">
                {selectedWrit.seizureItems.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Seized Items ({selectedWrit.seizureItems.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedWrit.seizureItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-3 bg-stone-50">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium flex-1">{item.description}</p>
                            <Badge variant="outline" className="text-xs ml-2">{item.status}</Badge>
                          </div>
                          <div className="space-y-1 text-xs text-stone-600">
                            <p>Value: <span className="font-medium text-stone-900">{formatCurrency(item.estimatedValue)}</span></p>
                            <p>Condition: {item.condition}</p>
                            <p>Location: {item.location}</p>
                            <p>Seized: {formatDate(item.seizedDate)}</p>
                            {item.gpsCoordinates && (
                              <a
                                href={getGoogleMapsLink(item.gpsCoordinates)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                </svg>
                                GPS: {item.gpsCoordinates}
                              </a>
                            )}
                          </div>
                          {item.photos && item.photos.length > 0 && (
                            <div className="mt-2 grid grid-cols-3 gap-2">
                              {item.photos.map((photo, idx) => (
                                <img
                                  key={idx}
                                  src={photo}
                                  alt={`Seizure photo ${idx + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium">
                          Total Seized Value: {formatCurrency(selectedWrit.seizureItems.reduce((sum, item) => sum + item.estimatedValue, 0))}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Record Seizure */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Record New Seizure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Item Description *</label>
                      <Textarea
                        value={seizureDescription}
                        onChange={(e) => setSeizureDescription(e.target.value)}
                        placeholder="Describe the seized item(s)..."
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Estimated Value (KES) *</label>
                      <Input
                        type="number"
                        value={seizureValue}
                        onChange={(e) => setSeizureValue(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Condition *</label>
                      <Input
                        value={seizureCondition}
                        onChange={(e) => setSeizureCondition(e.target.value)}
                        placeholder="e.g., Good, Fair, Damaged"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Storage Location *</label>
                      <div className="flex gap-2">
                        <Input
                          value={seizureStorageLocation}
                          onChange={(e) => setSeizureStorageLocation(e.target.value)}
                          placeholder="Where will it be stored?"
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleGetGPS('seizure')}
                          variant="outline"
                          disabled={gpsLoading}
                          className="shrink-0"
                        >
                          {gpsLoading ? (
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          )}
                        </Button>
                      </div>
                      {seizureGPS && (
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          GPS: {seizureGPS}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Photos (Optional)</label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-stone-600 mt-1">Take photos of seized items for documentation</p>
                      {seizurePhotos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {seizurePhotos.map((photo, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={photo}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                onClick={() => handleRemovePhoto(idx)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button onClick={handleRecordSeizure} className="w-full bg-amber-700 hover:bg-amber-800">
                      Record Seizure
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Fees Tab */}
              <TabsContent value="fees" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fee Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total Charged:</span>
                      <span className="font-bold">{formatCurrency(selectedWrit.totalFeesCharged)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Collected:</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(selectedWrit.totalFeesCollected)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t">
                      <span>Outstanding:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(selectedWrit.totalFeesCharged - selectedWrit.totalFeesCollected)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Fee Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedWrit.fees.map((fee) => (
                      <div key={fee.id} className="border rounded-lg p-3 bg-stone-50">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium flex-1">{fee.description}</p>
                          <Badge variant={fee.paid ? 'default' : 'destructive'} className="text-xs ml-2">
                            {fee.paid ? 'Paid' : 'Unpaid'}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-stone-900">{formatCurrency(fee.amount)}</p>
                        {fee.paid && fee.receiptNumber && (
                          <p className="text-xs text-stone-600 mt-1">Receipt: {fee.receiptNumber}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50/30 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold">Sheriff Mobile</h1>
            <p className="text-sm text-amber-100">Field Officer Portal</p>
          </div>
          <div className="flex items-center gap-2">
            {!online && (
              <Badge variant="destructive" className="text-xs">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                </svg>
                Offline
              </Badge>
            )}
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center font-bold">
              {currentOfficer.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>
        </div>
        {!online && pendingSync > 0 && (
          <div className="mt-2 text-xs bg-amber-700/50 rounded px-2 py-1">
            {pendingSync} item{pendingSync > 1 ? 's' : ''} pending sync
          </div>
        )}
      </div>

      {/* Main Content */}
      <ScrollArea className="h-[calc(100vh-140px)]">
        {activeView === 'dashboard' && (
          <div className="p-4 space-y-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-amber-100">Total Writs</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-sm text-blue-100">In Progress</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-400 to-amber-500 text-white border-0">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-amber-100">Pending</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold">{stats.executed}</p>
                  <p className="text-sm text-emerald-100">Executed</p>
                </CardContent>
              </Card>
            </div>

            {/* Offline Status Card */}
            {!online && (
              <Card className="border-2 border-amber-400 bg-amber-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm">
                      <p className="font-medium text-amber-900">You're working offline</p>
                      <p className="text-amber-700 mt-1">Your data is saved locally and will sync when you're back online.</p>
                      {lastSync && (
                        <p className="text-xs text-amber-600 mt-2">
                          Last synced: {new Date(lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <Button onClick={() => setActiveView('writs')} className="bg-amber-700 hover:bg-amber-800 h-auto py-4 flex-col gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">View Writs</span>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex-col gap-2 border-2" onClick={() => setActiveView('writs')}>
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">Search</span>
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Urgent Writs</CardTitle>
                <CardDescription>Requires immediate attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {writs.filter(w => w.priority === 'urgent').map((writ) => (
                  <div
                    key={writ.id}
                    onClick={() => setSelectedWrit(writ)}
                    className="border rounded-lg p-3 bg-white hover:bg-amber-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{writ.writNumber}</p>
                        <p className="text-xs text-stone-600">{writ.caseNumber}</p>
                      </div>
                      <Badge variant="destructive" className="text-xs">URGENT</Badge>
                    </div>
                    <p className="text-sm text-stone-700">{writ.targetParty}</p>
                    <p className="text-xs text-stone-500 mt-1">Expires: {formatDate(writ.expiryDate)}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeView === 'writs' && (
          <div className="p-4 space-y-4">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Input
                  placeholder="Search writs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="executed">Executed</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Writs List */}
            <div className="space-y-3">
              {filteredWrits.map((writ) => (
                <Card
                  key={writ.id}
                  onClick={() => setSelectedWrit(writ)}
                  className="cursor-pointer hover:shadow-md transition-shadow bg-white/80 backdrop-blur"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{writ.writNumber}</p>
                        <p className="text-xs text-stone-600">{writ.caseNumber}</p>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge variant={getPriorityColor(writ.priority)} className="text-xs">
                          {writ.priority}
                        </Badge>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(writ.status)}`}>
                          {writ.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-stone-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-stone-900">{writ.targetParty}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-stone-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-stone-700 text-xs">{writ.targetAddress}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t text-xs">
                        <span className="text-stone-600">Type: <span className="font-medium text-stone-900">{getWritTypeLabel(writ.type)}</span></span>
                        <span className="text-stone-600">Expires: <span className="font-medium text-red-600">{formatDate(writ.expiryDate)}</span></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Officer Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                    {currentOfficer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-lg">{currentOfficer.name}</p>
                    <p className="text-sm text-stone-600">Badge: {currentOfficer.badge}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-stone-600">Email:</span>
                    <span className="font-medium">{currentOfficer.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-stone-600">Phone:</span>
                    <span className="font-medium">{currentOfficer.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-stone-600">Zone:</span>
                    <span className="font-medium">{currentOfficer.zone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-stone-600">Active Writs:</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-stone-600">Service Attempts:</span>
                  <span className="font-bold">
                    {writs.reduce((sum, writ) => sum + writ.serviceAttempts.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-stone-600">Seizures Recorded:</span>
                  <span className="font-bold">
                    {writs.reduce((sum, writ) => sum + writ.seizureItems.length, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Offline Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sync Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-600">Connection:</span>
                  <Badge variant={online ? 'default' : 'destructive'}>
                    {online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                {lastSync && (
                  <div className="flex justify-between py-2">
                    <span className="text-stone-600">Last Sync:</span>
                    <span className="font-medium">{new Date(lastSync).toLocaleString()}</span>
                  </div>
                )}
                {pendingSync > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-stone-600">Pending Sync:</span>
                    <span className="font-medium text-amber-600">{pendingSync} items</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button variant="destructive" className="w-full">
              Logout
            </Button>
          </div>
        )}
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="grid grid-cols-3 gap-1 p-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              activeView === 'dashboard' ? 'bg-amber-100 text-amber-800' : 'text-stone-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => setActiveView('writs')}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              activeView === 'writs' ? 'bg-amber-100 text-amber-800' : 'text-stone-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Writs</span>
          </button>
          <button
            onClick={() => setActiveView('profile')}
            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
              activeView === 'profile' ? 'bg-amber-100 text-amber-800' : 'text-stone-600'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
