
import { useState, useEffect } from 'react';
import { trpc } from '@/utils/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import type { AntiqueItem, GalleryImage, PageContent, ContactForm, StoreSettings, CreateAntiqueItemInput, CreateGalleryImageInput, CreateContactFormInput } from '../../server/src/schema';

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [antiqueItems, setAntiqueItems] = useState<AntiqueItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [pageContent, setPageContent] = useState<PageContent[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings | null>(null);
  const [selectedItem, setSelectedItem] = useState<AntiqueItem | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [items, gallery, pages, settings] = await Promise.all([
        trpc.getAntiqueItems.query(),
        trpc.getGalleryImages.query(),
        trpc.getAllPageContent.query(),
        trpc.getStoreSettings.query()
      ]);
      
      setAntiqueItems(items);
      setGalleryImages(gallery);
      setPageContent(pages);
      setStoreSettings(settings);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const getPageContentBySlug = (slug: string): PageContent | undefined => {
    return pageContent.find(page => page.page_slug === slug && page.is_published);
  };

  // Header Component
  const Header = () => (
    <header className="bg-amber-50 border-b-2 border-amber-200 shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-serif text-amber-900 font-bold">
              🏺 {storeSettings?.store_name || 'Antique Treasures'}
            </h1>
          </div>
          <nav className="flex space-x-6">
            <Button 
              variant={currentPage === 'home' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('home')}
              className="text-amber-800 hover:text-amber-900"
            >
              Beranda
            </Button>
            <Button 
              variant={currentPage === 'about' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('about')}
              className="text-amber-800 hover:text-amber-900"
            >
              Tentang Toko
            </Button>
            <Button 
              variant={currentPage === 'collection' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('collection')}
              className="text-amber-800 hover:text-amber-900"
            >
              Koleksi Barang
            </Button>
            <Button 
              variant={currentPage === 'gallery' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('gallery')}
              className="text-amber-800 hover:text-amber-900"
            >
              Galeri
            </Button>
            <Button 
              variant={currentPage === 'contact' ? 'default' : 'ghost'}
              onClick={() => setCurrentPage('contact')}
              className="text-amber-800 hover:text-amber-900"
            >
              Kontak
            </Button>
            <Button
              variant={isAdmin ? 'destructive' : 'outline'}
              onClick={() => setIsAdmin(!isAdmin)}
              className="ml-4"
            >
              {isAdmin ? '🔒 Exit Admin' : '⚙️ Admin'}
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );

  // Home Page Component
  const HomePage = () => {
    const featuredItems = antiqueItems.filter(item => item.availability_status === 'available').slice(0, 3);
    const featuredGallery = galleryImages.filter(img => img.is_featured).slice(0, 3);
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h2 className="text-5xl font-serif text-amber-900 mb-6">
              Selamat Datang di Dunia Barang Antik
            </h2>
            <p className="text-xl text-amber-700 mb-8 max-w-2xl mx-auto">
              {storeSettings?.store_description || 'Temukan koleksi barang antik pilihan dengan kualitas terbaik dan keaslian terjamin'}
            </p>
            <Button 
              size="lg" 
              onClick={() => setCurrentPage('collection')}
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
            >
              Jelajahi Koleksi 🔍
            </Button>
          </div>
        </section>

        {/* Featured Items */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-serif text-amber-900 text-center mb-12">
              ✨ Koleksi Unggulan
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredItems.length > 0 ? featuredItems.map((item: AntiqueItem) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow border-amber-200">
                  <CardHeader>
                    {item.main_image_url && (
                      <img 
                        src={item.main_image_url} 
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <CardTitle className="text-amber-900 font-serif">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-amber-700 mb-4 line-clamp-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-amber-900">
                        Rp {item.price.toLocaleString('id-ID')}
                      </span>
                      <Button 
                        onClick={() => setSelectedItem(item)}
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Detail
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-amber-600 text-lg">Koleksi barang antik akan segera ditampilkan</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Gallery */}
        {featuredGallery.length > 0 && (
          <section className="py-16 bg-amber-50">
            <div className="container mx-auto px-4">
              <h3 className="text-3xl font-serif text-amber-900 text-center mb-12">
                🖼️ Galeri Pilihan
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredGallery.map((image: GalleryImage) => (
                  <div key={image.id} className="group cursor-pointer">
                    <img 
                      src={image.image_url} 
                      alt={image.alt_text || image.title}
                      className="w-full h-64 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow"
                    />
                    <h4 className="mt-4 text-xl font-serif text-amber-900">{image.title}</h4>
                    {image.description && (
                      <p className="text-amber-700 mt-2">{image.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    );
  };

  // About Page Component
  const AboutPage = () => {
    const aboutContent = getPageContentBySlug('about');
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="bg-amber-100">
              <CardTitle className="text-3xl font-serif text-amber-900 text-center">
                📖 {aboutContent?.title || 'Tentang Toko Kami'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="prose prose-amber max-w-none">
                {aboutContent?.content ? (
                  <div dangerouslySetInnerHTML={{ __html: aboutContent.content }} />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-amber-600 text-lg">
                      Informasi tentang toko akan segera ditampilkan melalui sistem CMS.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Collection Page Component
  const CollectionPage = () => {
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [conditionFilter, setConditionFilter] = useState<string>('all');
    const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');

    const filteredItems = antiqueItems.filter((item: AntiqueItem) => {
      return (categoryFilter === 'all' || item.category === categoryFilter) &&
             (conditionFilter === 'all' || item.condition === conditionFilter) &&
             (availabilityFilter === 'all' || item.availability_status === availabilityFilter);
    });

    const categories = [...new Set(antiqueItems.map(item => item.category))];
    const conditions = ['excellent', 'very_good', 'good', 'fair', 'needs_restoration'];
    const availabilityStatuses = ['available', 'sold', 'reserved'];

    const getConditionLabel = (condition: string) => {
      const labels: Record<string, string> = {
        'excellent': 'Sangat Baik',
        'very_good': 'Baik Sekali',
        'good': 'Baik',
        'fair': 'Cukup',
        'needs_restoration': 'Perlu Restorasi'
      };
      return labels[condition] || condition;
    };

    const getAvailabilityLabel = (status: string) => {
      const labels: Record<string, string> = {
        'available': 'Tersedia',
        'sold': 'Terjual',
        'reserved': 'Dipesan'
      };
      return labels[status] || status;
    };

    const getAvailabilityColor = (status: string) => {
      switch (status) {
        case 'available': return 'bg-green-100 text-green-800';
        case 'sold': return 'bg-red-100 text-red-800';
        case 'reserved': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif text-amber-900 text-center mb-12">
            🏺 Koleksi Barang Antik
          </h2>

          {/* Filters */}
          <Card className="mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="text-amber-900">Filter Koleksi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="category">Kategori</Label>
                  <Select value={categoryFilter || 'all'} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kategori</SelectItem>
                      {categories.map((category: string) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Kondisi</Label>
                  <Select value={conditionFilter || 'all'} onValueChange={setConditionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kondisi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Kondisi</SelectItem>
                      {conditions.map((condition: string) => (
                        <SelectItem key={condition} value={condition}>
                          {getConditionLabel(condition)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="availability">Ketersediaan</Label>
                  <Select value={availabilityFilter || 'all'} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ketersediaan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Status</SelectItem>
                      {availabilityStatuses.map((status: string) => (
                        <SelectItem key={status} value={status}>
                          {getAvailabilityLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.length > 0 ? filteredItems.map((item: AntiqueItem) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow border-amber-200">
                <CardHeader>
                  {item.main_image_url && (
                    <img 
                      src={item.main_image_url} 
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-md mb-4"
                    />
                  )}
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-amber-900 font-serif flex-1">{item.name}</CardTitle>
                    <Badge className={getAvailabilityColor(item.availability_status)}>
                      {getAvailabilityLabel(item.availability_status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-amber-700 mb-4 line-clamp-3">{item.description}</p>
                  <div className="space-y-2 text-sm text-amber-600 mb-4">
                    {item.year && <p><strong>Tahun:</strong> {item.year}</p>}
                    {item.origin && <p><strong>Asal:</strong> {item.origin}</p>}
                    <p><strong>Kategori:</strong> {item.category}</p>
                    <p><strong>Kondisi:</strong> {getConditionLabel(item.condition)}</p>
                    {item.dimensions && <p><strong>Dimensi:</strong> {item.dimensions}</p>}
                    {item.material && <p><strong>Material:</strong> {item.material}</p>}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-amber-900">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <Button 
                      onClick={() => setSelectedItem(item)}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      Detail
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-amber-600 text-lg">
                  {antiqueItems.length === 0 
                    ? 'Koleksi barang antik akan segera ditampilkan'
                    : 'Tidak ada barang yang sesuai dengan filter yang dipilih'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Gallery Page Component
  const GalleryPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-serif text-amber-900 text-center mb-12">
            🖼️ Galeri Foto
          </h2>

          {galleryImages.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {galleryImages
                .sort((a: GalleryImage, b: GalleryImage) => a.display_order - b.display_order)
                .map((image: GalleryImage) => (
                <Card key={image.id} className="group cursor-pointer hover:shadow-lg transition-shadow border-amber-200">
                  <CardContent className="p-0">
                    <img 
                      src={image.image_url} 
                      alt={image.alt_text || image.title}
                      className="w-full h-64 object-cover rounded-t-lg"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-serif text-amber-900 mb-2">{image.title}</h3>
                      {image.description && (
                        <p className="text-amber-700">{image.description}</p>
                      )}
                      {image.is_featured && (
                        <Badge className="mt-2 bg-amber-100 text-amber-800">
                          ⭐ Unggulan
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-amber-600 text-lg">Galeri foto akan segera ditampilkan</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Contact Page Component
  const ContactPage = () => {
    const [contactForm, setContactForm] = useState<CreateContactFormInput>({
      name: '',
      email: '',
      phone: null,
      subject: '',
      message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await trpc.createContactForm.mutate(contactForm);
        setSubmitMessage('Pesan Anda telah berhasil dikirim! Kami akan segera menghubungi Anda.');
        setContactForm({
          name: '',
          email: '',
          phone: null,
          subject: '',
          message: ''
        });
      } catch (error) {
        setSubmitMessage('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.');
        console.error('Failed to submit contact form:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-4xl font-serif text-amber-900 text-center mb-12">
            📞 Hubungi Kami
          </h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="bg-amber-100">
                <CardTitle className="text-amber-900">Kirim Pesan</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactForm((prev: CreateContactFormInput) => ({ ...prev, name: e.target.value }))
                      }
                      required
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactForm((prev: CreateContactFormInput) => ({ ...prev, email: e.target.value }))
                      }
                      required
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      value={contactForm.phone || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactForm((prev: CreateContactFormInput) => ({ 
                          ...prev, 
                          phone: e.target.value || null 
                        }))
                      }
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subjek *</Label>
                    <Input
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setContactForm((prev: CreateContactFormInput) => ({ ...prev, subject: e.target.value }))
                      }
                      required
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Pesan *</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={contactForm.message}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                        setContactForm((prev: CreateContactFormInput) => ({ ...prev, message: e.target.value }))
                      }
                      required
                      className="border-amber-200 focus:border-amber-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-amber-600 hover:bg-amber-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengirim...' : 'Kirim Pesan 📧'}
                  </Button>
                  {submitMessage && (
                    <p className={`text-center ${submitMessage.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                      {submitMessage}
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-6">
              <Card className="border-amber-200 shadow-lg">
                <CardHeader className="bg-amber-100">
                  <CardTitle className="text-amber-900">Informasi Kontak</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {storeSettings?.contact_email && (
                    <div className="flex items-center space-x-3">
                      <span className="text-amber-600">📧</span>
                      <span>Email: {storeSettings.contact_email}</span>
                    </div>
                  )}
                  {storeSettings?.contact_phone && (
                    <div className="flex items-center space-x-3">
                      <span className="text-amber-600">📱</span>
                      <span>Telepon: {storeSettings.contact_phone}</span>
                    </div>
                  )}
                  {storeSettings?.address && (
                    <div className="flex items-start space-x-3">
                      <span className="text-amber-600">📍</span>
                      <span>Alamat: {storeSettings.address}</span>
                    </div>
                  )}
                  {storeSettings?.business_hours && (
                    <div className="flex items-start space-x-3">
                      <span className="text-amber-600">🕒</span>
                      <span>Jam Buka: {storeSettings.business_hours}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Social Media */}
              {(storeSettings?.social_facebook || storeSettings?.social_instagram || storeSettings?.social_twitter) && (
                <Card className="border-amber-200 shadow-lg">
                  <CardHeader className="bg-amber-100">
                    <CardTitle className="text-amber-900">Media Sosial</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      {storeSettings?.social_facebook && (
                        <a 
                          href={storeSettings.social_facebook} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          📘 Facebook
                        </a>
                      )}
                      {storeSettings?.social_instagram && (
                        <a 
                          href={storeSettings.social_instagram} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-pink-600 hover:text-pink-800"
                        >
                          📷 Instagram
                        </a>
                      )}
                      {storeSettings?.social_twitter && (
                        <a 
                          href={storeSettings.social_twitter} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-600"
                        >
                          🐦 Twitter
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Google Maps */}
              {storeSettings?.google_maps_embed_url && (
                <Card className="border-amber-200 shadow-lg">
                  <CardHeader className="bg-amber-100">
                    <CardTitle className="text-amber-900">Lokasi Toko</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <iframe
                      src={storeSettings.google_maps_embed_url}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-b-lg"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Admin Panel Component
  const AdminPanel = () => {
    return (
      <div className="min-h-screen bg-gray-100 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            ⚙️ Panel Admin - Content Management System
          </h2>

          <Tabs defaultValue="items" className="space-y-6">
            <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
              <TabsTrigger value="items">Barang Antik</TabsTrigger>
              <TabsTrigger value="gallery">Galeri</TabsTrigger>
              <TabsTrigger value="pages">Halaman</TabsTrigger>
              <TabsTrigger value="contacts">Kontak</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>

            <TabsContent value="items">
              <AntiqueItemsAdmin antiqueItems={antiqueItems} onUpdate={loadData} />
            </TabsContent>

            <TabsContent value="gallery">
              <GalleryAdmin galleryImages={galleryImages} onUpdate={loadData} />
            </TabsContent>

            <TabsContent value="pages">
              <PagesAdmin pageContent={pageContent} />
            </TabsContent>

            <TabsContent value="contacts">
              <ContactsAdmin />
            </TabsContent>

            <TabsContent value="settings">
              <SettingsAdmin storeSettings={storeSettings} onUpdate={loadData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  // Item Detail Dialog
  const ItemDetailDialog = () => {
    if (!selectedItem) return null;

    const getConditionLabel = (condition: string) => {
      const labels: Record<string, string> = {
        'excellent': 'Sangat Baik',
        'very_good': 'Baik Sekali',
        'good': 'Baik',
        'fair': 'Cukup',
        'needs_restoration': 'Perlu Restorasi'
      };
      return labels[condition] || condition;
    };

    const getAvailabilityLabel = (status: string) => {
      const labels: Record<string, string> = {
        'available': 'Tersedia',
        'sold': 'Terjual',
        'reserved': 'Dipesan'
      };
      return labels[status] || status;
    };

    const getAvailabilityColor = (status: string) => {
      switch (status) {
        case 'available': return 'bg-green-100 text-green-800';
        case 'sold': return 'bg-red-100 text-red-800';
        case 'reserved': return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-serif text-amber-900">
              {selectedItem.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              {selectedItem.main_image_url && (
                <img 
                  src={selectedItem.main_image_url} 
                  alt={selectedItem.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-3xl font-bold text-amber-900">
                  Rp {selectedItem.price.toLocaleString('id-ID')}
                </h3>
                <Badge className={getAvailabilityColor(selectedItem.availability_status)}>
                  {getAvailabilityLabel(selectedItem.availability_status)}
                </Badge>
              </div>
              
              <p className="text-amber-700 text-lg">{selectedItem.description}</p>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedItem.year && (
                  <div>
                    <strong className="text-amber-900">Tahun:</strong>
                    <p className="text-amber-700">{selectedItem.year}</p>
                  </div>
                )}
                {selectedItem.origin && (
                  <div>
                    <strong className="text-amber-900">Asal:</strong>
                    <p className="text-amber-700">{selectedItem.origin}</p>
                  </div>
                )}
                <div>
                  <strong className="text-amber-900">Kategori:</strong>
                  <p className="text-amber-700">{selectedItem.category}</p>
                </div>
                <div>
                  <strong className="text-amber-900">Kondisi:</strong>
                  <p className="text-amber-700">{getConditionLabel(selectedItem.condition)}</p>
                </div>
                {selectedItem.dimensions && (
                  <div>
                    <strong className="text-amber-900">Dimensi:</strong>
                    <p className="text-amber-700">{selectedItem.dimensions}</p>
                  </div>
                )}
                {selectedItem.material && (
                  <div>
                    <strong className="text-amber-900">Material:</strong>
                    <p className="text-amber-700">{selectedItem.material}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="text-xs text-amber-600">
                <p>Dibuat: {selectedItem.created_at.toLocaleDateString('id-ID')}</p>
                <p>Diperbarui: {selectedItem.updated_at.toLocaleDateString('id-ID')}</p>
              </div>
              
              {selectedItem.availability_status === 'available' && (
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-3"
                  onClick={() => setCurrentPage('contact')}
                >
                  Hubungi untuk Pembelian 📞
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Render current page
  const renderPage = () => {
    if (isAdmin) return <AdminPanel />;
    
    switch (currentPage) {
      case 'home': return <HomePage />;
      case 'about': return <AboutPage />;
      case 'collection': return <CollectionPage />;
      case 'gallery': return <GalleryPage />;
      case 'contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-amber-50">
      <Header />
      {renderPage()}
      <ItemDetailDialog />
      
      {/* Footer */}
      <footer className="bg-amber-900 text-amber-100 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-serif">
            &copy; 2024 {storeSettings?.store_name || 'Antique Treasures'} - 
            Koleksi Barang Antik Berkualitas
          </p>
          <p className="text-amber-300 mt-2">
            Temukan keindahan masa lalu untuk masa depan yang bersejarah
          </p>
        </div>
      </footer>
    </div>
  );
}

// Admin Components
const AntiqueItemsAdmin = ({ antiqueItems, onUpdate }: { 
  antiqueItems: AntiqueItem[], 
  onUpdate: () => void 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateAntiqueItemInput>({
    name: '',
    description: '',
    year: null,
    origin: null,
    price: 0,
    availability_status: 'available',
    category: '',
    condition: 'good',
    dimensions: null,
    material: null,
    main_image_url: null
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trpc.createAntiqueItem.mutate(formData);
      setIsCreating(false);
      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Failed to create item:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteAntiqueItem.mutate({ id });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      year: null,
      origin: null,
      price: 0,
      availability_status: 'available',
      category: '',
      condition: 'good',
      dimensions: null,
      material: null,
      main_image_url: null
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Kelola Barang Antik</h3>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          Tambah Barang Baru
        </Button>
      </div>

      {/* Create Form */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Barang Antik Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nama Barang *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Kategori *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ ...prev, category: e.target.value }))
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Deskripsi *</Label>
              <Textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateAntiqueItemInput) => ({ ...prev, description: e.target.value }))
                }
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Harga *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="year">Tahun</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ 
                      ...prev, 
                      year: e.target.value ? parseInt(e.target.value) : null 
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="origin">Asal</Label>
                <Input
                  id="origin"
                  value={formData.origin || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ 
                      ...prev, 
                      origin: e.target.value || null 
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="condition">Kondisi</Label>
                <Select 
                  value={formData.condition} 
                  onValueChange={(value: 'excellent' | 'very_good' | 'good' | 'fair' | 'needs_restoration') =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ ...prev, condition: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Sangat Baik</SelectItem>
                    <SelectItem value="very_good">Baik Sekali</SelectItem>
                    <SelectItem value="good">Baik</SelectItem>
                    <SelectItem value="fair">Cukup</SelectItem>
                    <SelectItem value="needs_restoration">Perlu Restorasi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="availability">Status Ketersediaan</Label>
                <Select 
                  value={formData.availability_status} 
                  onValueChange={(value: 'available' | 'sold' | 'reserved') =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ ...prev, availability_status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Tersedia</SelectItem>
                    <SelectItem value="sold">Terjual</SelectItem>
                    <SelectItem value="reserved">Dipesan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dimensions">Dimensi</Label>
                <Input
                  id="dimensions"
                  value={formData.dimensions || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ 
                      ...prev, 
                      dimensions: e.target.value || null 
                    }))
                  }
                  placeholder="contoh: 30x20x15 cm"
                />
              </div>
              <div>
                <Label htmlFor="material">Material</Label>
                <Input
                  id="material"
                  value={formData.material || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateAntiqueItemInput) => ({ 
                      ...prev, 
                      material: e.target.value || null 
                    }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="image_url">URL Gambar</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.main_image_url || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateAntiqueItemInput) => ({ 
                    ...prev, 
                    main_image_url: e.target.value || null 
                  }))
                }
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Items List */}
      <div className="grid gap-4">
        {antiqueItems.map((item: AntiqueItem) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold">{item.name}</h4>
                  <p className="text-gray-600 line-clamp-2">{item.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                    <span>Rp {item.price.toLocaleString('id-ID')}</span>
                    <span>{item.category}</span>
                    <Badge className={
                      item.availability_status === 'available' ? 'bg-green-100 text-green-800' :
                      item.availability_status === 'sold' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {item.availability_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus "{item.name}"? Aksi ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const GalleryAdmin = ({ galleryImages, onUpdate }: { 
  galleryImages: GalleryImage[], 
  onUpdate: () => void 
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateGalleryImageInput>({
    title: '',
    description: null,
    image_url: '',
    alt_text: null,
    display_order: 0,
    is_featured: false
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trpc.createGalleryImage.mutate(formData);
      setIsCreating(false);
      setFormData({
        title: '',
        description: null,
        image_url: '',
        alt_text: null,
        display_order: 0,
        is_featured: false
      });
      onUpdate();
    } catch (error) {
      console.error('Failed to create gallery image:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await trpc.deleteGalleryImage.mutate({ id });
      onUpdate();
    } catch (error) {
      console.error('Failed to delete gallery image:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Kelola Galeri</h3>
        <Button onClick={() => setIsCreating(true)} className="bg-blue-600 hover:bg-blue-700">
          Tambah Gambar
        </Button>
      </div>

      {/* Create Form */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Gambar ke Galeri</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label htmlFor="title">Judul *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateGalleryImageInput) => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="image_url">URL Gambar *</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateGalleryImageInput) => ({ ...prev, image_url: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev: CreateGalleryImageInput) => ({ 
                    ...prev, 
                    description: e.target.value || null 
                  }))
                }
              />
            </div>
            <div>
              <Label htmlFor="alt_text">Alt Text</Label>
              <Input
                id="alt_text"
                value={formData.alt_text || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev: CreateGalleryImageInput) => ({ 
                    ...prev, 
                    alt_text: e.target.value || null 
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="display_order">Urutan Tampil</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateGalleryImageInput) => ({ 
                      ...prev, 
                      display_order: parseInt(e.target.value) || 0 
                    }))
                  }
                />
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev: CreateGalleryImageInput) => ({ ...prev, is_featured: e.target.checked }))
                  }
                  className="rounded"
                />
                <Label htmlFor="is_featured">Gambar Unggulan</Label>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Gallery List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map((image: GalleryImage) => (
          <Card key={image.id}>
            <CardContent className="p-4">
              <img 
                src={image.image_url} 
                alt={image.alt_text || image.title}
                className="w-full h-48 object-cover rounded mb-3"
              />
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{image.title}</h4>
                  {image.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{image.description}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-500">Urutan: {image.display_order}</span>
                    {image.is_featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">Unggulan</Badge>
                    )}
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Hapus
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus gambar "{image.title}"?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(image.id)}>
                        Hapus
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
        {galleryImages.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            Belum ada gambar di galeri
          </div>
        )}
      </div>
    </div>
  );
};

const PagesAdmin = ({ pageContent }: { 
  pageContent: PageContent[]
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold">Kelola Halaman</h3>
        <Button className="bg-blue-600 hover:bg-blue-700">
          Tambah Halaman
        </Button>
      </div>

      <div className="grid gap-4">
        {pageContent.map((page: PageContent) => (
          <Card key={page.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold flex items-center space-x-2">
                    <span>{page.title}</span>
                    <Badge variant={page.is_published ? 'default' : 'secondary'}>
                      {page.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </h4>
                  <p className="text-gray-600">Slug: {page.page_slug}</p>
                  <p className="text-gray-500 text-sm">
                    Dibuat: {page.created_at.toLocaleDateString('id-ID')} | 
                    Diperbarui: {page.updated_at.toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        Hapus
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus halaman "{page.title}"?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction>
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {pageContent.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada halaman yang dibuat
          </div>
        )}
      </div>
    </div>
  );
};

const ContactsAdmin = () => {
  const [contacts, setContacts] = useState<ContactForm[]>([]);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const result = await trpc.getContactForms.query();
      setContacts(result);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await trpc.markContactFormRead.mutate({ id });
      loadContacts();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Pesan Kontak</h3>

      <div className="grid gap-4">
        {contacts.map((contact: ContactForm) => (
          <Card key={contact.id} className={!contact.is_read ? 'border-blue-200 bg-blue-50' : ''}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-lg font-semibold">{contact.name}</h4>
                    {!contact.is_read && <Badge className="bg-blue-100 text-blue-800">Baru</Badge>}
                  </div>
                  <p className="text-gray-600 mb-2">
                    <strong>Email:</strong> {contact.email}
                    {contact.phone && <span> | <strong>Telepon:</strong> {contact.phone}</span>}
                  </p>
                  <p className="text-gray-800 font-medium mb-2">
                    <strong>Subjek:</strong> {contact.subject}
                  </p>
                  <p className="text-gray-700 mb-3">{contact.message}</p>
                  <p className="text-gray-500 text-sm">
                    Dikirim: {contact.created_at.toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="flex flex-col space-y-2">
                  {!contact.is_read && (
                    <Button 
                       
                      onClick={() => markAsRead(contact.id)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Tandai Dibaca
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`mailto:${contact.email}?subject=Re: ${contact.subject}`)}
                  >
                    Balas Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {contacts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Belum ada pesan kontak
          </div>
        )}
      </div>
    </div>
  );
};

const SettingsAdmin = ({ storeSettings, onUpdate }: { 
  storeSettings: StoreSettings | null, 
  onUpdate: () => void 
}) => {
  const [formData, setFormData] = useState({
    store_name: storeSettings?.store_name || '',
    store_description: storeSettings?.store_description || '',
    contact_email: storeSettings?.contact_email || '',
    contact_phone: storeSettings?.contact_phone || '',
    address: storeSettings?.address || '',
    business_hours: storeSettings?.business_hours || '',
    google_maps_embed_url: storeSettings?.google_maps_embed_url || '',
    social_facebook: storeSettings?.social_facebook || '',
    social_instagram: storeSettings?.social_instagram || '',
    social_twitter: storeSettings?.social_twitter || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updateData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value || null])
      );
      await trpc.updateStoreSettings.mutate(updateData);
      onUpdate();
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Pengaturan Toko</h3>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="store_name">Nama Toko</Label>
                <Input
                  id="store_name"
                  value={formData.store_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, store_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Email Kontak</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, contact_email: e.target.value }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="store_description">Deskripsi Toko</Label>
              <Textarea
                id="store_description"
                rows={3}
                value={formData.store_description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, store_description: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_phone">Nomor Telepon</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, contact_phone: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="business_hours">Jam Operasional</Label>
                <Input
                  id="business_hours"
                  value={formData.business_hours}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, business_hours: e.target.value }))
                  }
                  placeholder="contoh: Senin-Sabtu 09:00-17:00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <Textarea
                id="address"
                rows={2}
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData((prev) => ({ ...prev, address: e.target.value }))
                }
              />
            </div>

            <div>
              <Label htmlFor="google_maps_embed_url">URL Google Maps Embed</Label>
              <Input
                id="google_maps_embed_url"
                type="url"
                value={formData.google_maps_embed_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setFormData((prev) => ({ ...prev, google_maps_embed_url: e.target.value }))
                }
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </div>

            <Separator />

            <h4 className="text-lg font-semibold">Media Sosial</h4>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="social_facebook">Facebook URL</Label>
                <Input
                  id="social_facebook"
                  type="url"
                  value={formData.social_facebook}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, social_facebook: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="social_instagram">Instagram URL</Label>
                <Input
                  id="social_instagram"
                  type="url"
                  value={formData.social_instagram}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, social_instagram: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="social_twitter">Twitter URL</Label>
                <Input
                  id="social_twitter"
                  type="url"
                  value={formData.social_twitter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFormData((prev) => ({ ...prev, social_twitter: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Simpan Pengaturan
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default App;
