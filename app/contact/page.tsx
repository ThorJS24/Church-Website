'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapPin, Phone, Mail, Clock, Send, User, MessageSquare, Calendar, Navigation, ChevronRight, ChevronLeft, Heart, Building, Video, Globe, Timer, UserCheck } from 'lucide-react';
import { getSiteSettings, getStaffMembers, SiteSettings, StaffMember } from '@/lib/content';
import { PageHero } from '@/components/ui/page-hero';
import { Section } from '@/components/ui/section';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Grid } from '@/components/ui/grid';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Accordion, AccordionItem } from '@/components/ui/accordion';
import { LoadingState } from '@/components/ui/states';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'spiritual', name: 'Spiritual & Community Life', icon: Heart },
  { id: 'administrative', name: 'Administrative & Facility', icon: Building },
  { id: 'media', name: 'Media & Communication', icon: Video },
  { id: 'outreach', name: 'Outreach & Missions', icon: Globe },
];

const RESPONSE_TIME: Record<string, string> = {
  spiritual: 'within 1-2 business days',
  administrative: 'within 2-3 business days',
  media: 'within 3-5 business days',
  outreach: 'within 3-5 business days',
};

const CONTACT_FAQ = [
  { id: 'response-time', q: 'How quickly will I hear back?', a: 'It depends on the type of request — typically 1-5 business days. Prayer requests marked urgent or emergency are prioritized and answered as soon as possible.' },
  { id: 'who-responds', q: 'Who will respond to my message?', a: 'Your message is routed based on the category you select, so it reaches the staff member or ministry team best equipped to help.' },
  { id: 'urgent', q: 'What if my need is urgent?', a: 'For a pastoral emergency, please call the church office directly rather than submitting the form — phone reaches us faster than email.' },
  { id: 'visit', q: 'Can I just stop by instead of submitting a form?', a: 'Absolutely — our office hours are listed on this page. You\'re always welcome to visit or call directly.' },
];

const formTypes: Record<string, { id: string; name: string }[]> = {
  spiritual: [
    { id: 'baptism', name: 'Baptism / Membership Inquiry' },
    { id: 'counseling', name: 'Counseling / Spiritual Guidance' },
    { id: 'volunteer', name: 'Volunteer / Service Opportunities' },
    { id: 'prayer', name: 'Prayer Request' },
  ],
  administrative: [
    { id: 'donations', name: 'Donations / Offerings' },
    { id: 'facility', name: 'Facility Booking' },
    { id: 'partnership', name: 'Partnership / Collaboration' },
  ],
  media: [
    { id: 'archive', name: 'Media / Sermon Archive Request' },
    { id: 'feedback', name: 'Website / Social Media Feedback' },
    { id: 'press', name: 'Press / Public Relations' },
  ],
  outreach: [
    { id: 'mission', name: 'Mission Support / Sponsorship' },
    { id: 'testimony', name: 'Testimony Submission' },
  ],
};

const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '',
  dateOfBirth: '', gender: '', maritalStatus: '', occupation: '', preferredContact: 'email',
  category: '', formType: '', subject: '', message: '', urgency: 'normal', preferredDate: '', alternateDate: '',
  baptismType: '', membershipStatus: '', previousChurch: '', baptismDate: '',
  counselingType: '', sessionType: '', availableTimes: [] as string[],
  volunteerAreas: [] as string[], availability: '', skills: '', experience: '', backgroundCheck: false,
  donationType: '', donationAmount: '', isRecurring: false, frequency: '',
  facilityType: '', eventDate: '', eventTime: '', guestCount: '', setupRequirements: '', cateringNeeded: false,
  organizationType: '', organizationName: '', contactPerson: '', partnershipType: '',
  mediaType: '', specificDate: '', format: '', feedbackType: '', pageUrl: '', deviceType: '',
  mediaOutlet: '', deadline: '', interviewType: '', missionArea: '', sponsorshipType: '', commitmentLevel: '',
  testimonyType: '', isPublic: false, anonymousSubmission: false, prayerCategory: '', isConfidential: false, followUpNeeded: false,
};

export default function ContactPage() {
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [officeHours, setOfficeHours] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    async function fetchData() {
      try {
        const [siteSettingsData, staffData] = await Promise.all([getSiteSettings(), getStaffMembers()]);
        if (siteSettingsData) {
          setSiteSettings(siteSettingsData);
          if (siteSettingsData.officeHours) setOfficeHours(siteSettingsData.officeHours);
        }
        setStaff(staffData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setSubmitStatus('success');
        setCurrentStep(1);
        setFormData(INITIAL_FORM);
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const canProceedStep1 = formData.firstName && formData.lastName && formData.email;
  const canProceedStep2 = formData.category && formData.formType;

  if (loading) return <LoadingState label="Loading contact information..." />;

  const contactInfo = [
    { icon: MapPin, title: 'Address', details: [siteSettings?.address || 'Address not available'] },
    { icon: Phone, title: 'Phone', details: [siteSettings?.phoneNumber || 'Phone not available'] },
    { icon: Mail, title: 'Email', details: [siteSettings?.email || 'Email not available'] },
    { icon: Clock, title: 'Office Hours', details: officeHours.length > 0 ? officeHours : ['Contact us for availability'] },
  ];

  return (
    <div>
      <PageHero
        icon={<MessageSquare />}
        eyebrow="Get In Touch"
        title="Contact Us"
        description="We'd love to hear from you. Get in touch with our church family."
      />

      <Section spacing="lg">
        <Grid cols={2} gap={12}>
          {/* Contact form */}
          <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            <Card variant="raised" padding="lg">
              <h2 className="text-headline-sm text-foreground">Send us a Message</h2>

              <div className="my-6">
                <div className="relative mb-3 flex items-center justify-between">
                  <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-border" />
                  <div
                    className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent transition-all duration-slow"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  />
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-body-sm font-medium',
                        currentStep >= step ? 'bg-accent text-accent-foreground' : 'bg-surface-active text-foreground-subtle'
                      )}
                    >
                      {step}
                    </div>
                  ))}
                </div>
                <p className="text-caption text-foreground-subtle">
                  Step {currentStep} of 3: {currentStep === 1 ? 'Personal Information' : currentStep === 2 ? 'Category Selection' : 'Details & Message'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {currentStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <Grid cols={2} gap={4}>
                      <Input label="First Name" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                      <Input label="Last Name" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </Grid>
                    <Grid cols={2} gap={4}>
                      <Input label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      <Input label="Phone Number" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    </Grid>
                    <Input label="Address" placeholder="Street address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                    <Grid cols={3} gap={4}>
                      <Input label="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                      <Input label="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                      <Input label="ZIP Code" value={formData.zipCode} onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })} />
                    </Grid>
                    <Grid cols={3} gap={4}>
                      <Input label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
                      <Select
                        label="Gender"
                        placeholder="Select"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'other', label: 'Other' }]}
                      />
                      <Select
                        label="Marital Status"
                        placeholder="Select"
                        value={formData.maritalStatus}
                        onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })}
                        options={[
                          { value: 'single', label: 'Single' },
                          { value: 'married', label: 'Married' },
                          { value: 'divorced', label: 'Divorced' },
                          { value: 'widowed', label: 'Widowed' },
                        ]}
                      />
                    </Grid>
                    <Grid cols={2} gap={4}>
                      <Input label="Occupation" value={formData.occupation} onChange={(e) => setFormData({ ...formData, occupation: e.target.value })} />
                      <Select
                        label="Preferred Contact Method"
                        value={formData.preferredContact}
                        onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                        options={[{ value: 'email', label: 'Email' }, { value: 'phone', label: 'Phone' }, { value: 'either', label: 'Either' }]}
                      />
                    </Grid>
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    <div>
                      <p className="mb-3 text-label text-foreground">Category *</p>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <button
                            type="button"
                            key={category.id}
                            onClick={() => setFormData({ ...formData, category: category.id, formType: '' })}
                            className={cn(
                              'rounded-lg border-2 p-4 text-left transition-colors',
                              formData.category === category.id ? 'border-accent bg-accent-subtle' : 'border-border hover:border-border-strong'
                            )}
                          >
                            <category.icon className="mb-2 h-5 w-5 text-accent" />
                            <p className="text-body-sm font-semibold text-foreground">{category.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.category && (
                      <>
                        <Select
                          label="Specific Request"
                          required
                          placeholder="Select request type"
                          value={formData.formType}
                          onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
                          options={formTypes[formData.category]?.map((t) => ({ value: t.id, label: t.name })) ?? []}
                        />
                        <div className="space-y-2 rounded-lg bg-surface p-4">
                          <p className="flex items-center gap-2 text-body-sm text-foreground-muted">
                            <Timer className="h-4 w-4 text-accent shrink-0" /> Expected response time: <strong className="text-foreground">{RESPONSE_TIME[formData.category]}</strong>
                          </p>
                          {(() => {
                            const routedStaff = staff.find((s) => s.handlesCategory === formData.category);
                            return routedStaff ? (
                              <p className="flex items-center gap-2 text-body-sm text-foreground-muted">
                                <UserCheck className="h-4 w-4 text-accent shrink-0" /> This will be routed to <strong className="text-foreground">{routedStaff.name}</strong> ({routedStaff.position})
                              </p>
                            ) : null;
                          })()}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                    {formData.formType === 'baptism' && (
                      <Grid cols={2} gap={4}>
                        <Select
                          label="Baptism Type"
                          placeholder="Select type"
                          value={formData.baptismType}
                          onChange={(e) => setFormData({ ...formData, baptismType: e.target.value })}
                          options={[{ value: 'adult', label: 'Adult Baptism' }, { value: 'infant', label: 'Infant Baptism' }, { value: 'confirmation', label: 'Confirmation' }]}
                        />
                        <Select
                          label="Membership Status"
                          placeholder="Select status"
                          value={formData.membershipStatus}
                          onChange={(e) => setFormData({ ...formData, membershipStatus: e.target.value })}
                          options={[
                            { value: 'new', label: 'New to Christianity' },
                            { value: 'transfer', label: 'Transferring from another church' },
                            { value: 'returning', label: 'Returning member' },
                          ]}
                        />
                      </Grid>
                    )}

                    {formData.formType === 'volunteer' && (
                      <div>
                        <p className="mb-2 text-label text-foreground">Areas of Interest</p>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {['Children Ministry', 'Youth Ministry', 'Music/Worship', 'Hospitality', 'Outreach', 'Administration'].map((area) => (
                            <Checkbox
                              key={area}
                              label={area}
                              checked={formData.volunteerAreas.includes(area)}
                              onChange={(e) => {
                                const areas = e.target.checked ? [...formData.volunteerAreas, area] : formData.volunteerAreas.filter((a) => a !== area);
                                setFormData({ ...formData, volunteerAreas: areas });
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {formData.formType === 'donations' && (
                      <Grid cols={2} gap={4}>
                        <Select
                          label="Donation Type"
                          placeholder="Select type"
                          value={formData.donationType}
                          onChange={(e) => setFormData({ ...formData, donationType: e.target.value })}
                          options={[
                            { value: 'tithe', label: 'Tithe' },
                            { value: 'offering', label: 'General Offering' },
                            { value: 'building', label: 'Building Fund' },
                            { value: 'missions', label: 'Missions' },
                          ]}
                        />
                        <Input
                          label="Amount (Optional)"
                          type="number"
                          placeholder="₹0.00"
                          value={formData.donationAmount}
                          onChange={(e) => setFormData({ ...formData, donationAmount: e.target.value })}
                        />
                      </Grid>
                    )}

                    {formData.formType === 'facility' && (
                      <Grid cols={3} gap={4}>
                        <Select
                          label="Facility Type"
                          placeholder="Select facility"
                          value={formData.facilityType}
                          onChange={(e) => setFormData({ ...formData, facilityType: e.target.value })}
                          options={[{ value: 'sanctuary', label: 'Main Sanctuary' }, { value: 'hall', label: 'Fellowship Hall' }, { value: 'classroom', label: 'Classroom' }]}
                        />
                        <Input label="Event Date" type="date" value={formData.eventDate} onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })} />
                        <Input label="Guest Count" type="number" value={formData.guestCount} onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })} />
                      </Grid>
                    )}

                    <Input label="Subject" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                    <Textarea label="Message" required rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />

                    {(formData.formType === 'prayer' || formData.formType === 'counseling') && (
                      <Select
                        label="Urgency Level"
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        options={[{ value: 'normal', label: 'Normal' }, { value: 'urgent', label: 'Urgent' }, { value: 'emergency', label: 'Emergency' }]}
                      />
                    )}
                  </motion.div>
                )}

                <div className="flex justify-between pt-2">
                  {currentStep > 1 && (
                    <Button type="button" variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={prevStep}>
                      Previous
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      className="ml-auto"
                      rightIcon={<ChevronRight className="h-4 w-4" />}
                      disabled={(currentStep === 1 && !canProceedStep1) || (currentStep === 2 && !canProceedStep2)}
                      onClick={nextStep}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" className="ml-auto" leftIcon={<Send className="h-4 w-4" />}>
                      Send Message
                    </Button>
                  )}
                </div>

                {submitStatus === 'success' && (
                  <div className="rounded-lg border border-success/30 bg-success-subtle p-4 text-body-sm text-success">
                    Thank you for your message! We&apos;ll get back to you soon.
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="rounded-lg border border-danger/30 bg-danger-subtle p-4 text-body-sm text-danger">
                    Something went wrong sending your message. Please try again, or reach us directly using the contact details on this page.
                  </div>
                )}
              </form>
            </Card>
          </motion.div>

          {/* Contact info */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="space-y-8">
            <div>
              <h2 className="text-headline-sm text-foreground">Get in Touch</h2>
              <p className="mt-3 text-body-md text-foreground-muted">
                Whether you&apos;re looking for information about our services, want to get involved, or need prayer, we&apos;re here for you. Don&apos;t hesitate to reach out!
              </p>
            </div>

            <div className="space-y-5">
              {contactInfo.map((info) => (
                <div key={info.title} className="flex items-start gap-4">
                  <div className="rounded-lg bg-accent-subtle p-3">
                    <info.icon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-title-sm text-foreground">{info.title}</h3>
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-body-sm text-foreground-muted">{detail}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Card>
              <h3 className="mb-4 text-title-sm text-foreground">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setCurrentStep(2);
                    setFormData({ ...formData, category: 'spiritual', formType: 'counseling' });
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-surface p-3 text-left text-body-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  <Calendar className="h-4 w-4 text-accent" /> Schedule a Meeting
                </button>
                <button
                  onClick={() => {
                    setCurrentStep(2);
                    setFormData({ ...formData, category: 'spiritual', formType: 'prayer' });
                  }}
                  className="flex w-full items-center gap-3 rounded-lg bg-surface p-3 text-left text-body-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  <MessageSquare className="h-4 w-4 text-accent" /> Submit Prayer Request
                </button>
                <a
                  href="https://www.google.com/maps/dir//SALEM+PRIMITIVE+BAPTIST+CHURCH,+Salem,+Tamil+Nadu/@11.678130577350974,78.16560039927737,17z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3babf16da41b56e5:0x30049390bc14cac1!2m2!1d78.16560039927737!2d11.678130577350974"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center gap-3 rounded-lg bg-surface p-3 text-body-sm text-foreground transition-colors hover:bg-surface-hover"
                >
                  <Navigation className="h-4 w-4 text-accent" /> Get Directions
                </a>
                {siteSettings?.whatsappGroupUrl && (
                  <a
                    href={siteSettings.whatsappGroupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center gap-3 rounded-lg bg-surface p-3 text-body-sm text-foreground transition-colors hover:bg-surface-hover"
                  >
                    <svg className="h-4 w-4 text-success" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488" />
                    </svg>
                    Join WhatsApp Group
                  </a>
                )}
              </div>
            </Card>
          </motion.div>
        </Grid>
      </Section>

      {staff.length > 0 && (
        <Section spacing="lg" className="bg-surface">
          <div className="mb-10 text-center">
            <h2 className="text-headline-md text-foreground">Our Staff</h2>
            <p className="mt-2 text-body-md text-foreground-muted">Meet our dedicated team who are here to serve you</p>
          </div>
          <Grid cols={4} gap={6}>
            {staff.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Card className="h-full text-center">
                  <Avatar name={member.name} size="xl" className="mx-auto mb-4" />
                  <h3 className="text-title-md text-foreground">{member.name}</h3>
                  <p className="mt-1 text-body-sm font-medium text-accent">{member.position}</p>
                  <div className="mt-3 space-y-1.5">
                    {member.email && (
                      <a href={`mailto:${member.email}`} className="flex items-center justify-center gap-2 text-body-sm text-foreground-muted hover:text-accent">
                        <Mail className="h-3.5 w-3.5" /> {member.email}
                      </a>
                    )}
                    {member.phone && (
                      <a href={`tel:${member.phone}`} className="flex items-center justify-center gap-2 text-body-sm text-foreground-muted hover:text-accent">
                        <Phone className="h-3.5 w-3.5" /> {member.phone}
                      </a>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </Grid>
        </Section>
      )}

      <Section spacing="lg" className="bg-surface">
        <Container size="sm">
          <div className="mb-8 text-center">
            <h2 className="text-headline-md text-foreground">Contact FAQ</h2>
          </div>
          <Card variant="raised" padding="lg">
            <Accordion type="single">
              {CONTACT_FAQ.map((item) => (
                <AccordionItem key={item.id} id={item.id} title={item.q}>
                  {item.a}
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </Container>
      </Section>

      <Section spacing="lg">
        <div className="mb-10 text-center">
          <h2 className="text-headline-md text-foreground">Find Us</h2>
          <p className="mt-2 text-body-md text-foreground-muted">Visit us at our location</p>
        </div>
        <div className="h-96 overflow-hidden rounded-xl border border-border">
          <iframe
            title="Church location map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d289.6717292106369!2d78.16560039927737!3d11.678130577350974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3babf16da41b56e5%3A0x30049390bc14cac1!2sSALEM%20PRIMITIVE%20BAPTIST%20CHURCH!5e1!3m2!1sen!2sin!4v1760932034062!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Section>
    </div>
  );
}
