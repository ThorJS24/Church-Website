export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
          
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
            </p>

            <h2>Information We Collect</h2>
            <p>Salem Primitive Baptist Church collects information to provide better services to our congregation and community:</p>
            <ul>
              <li><strong>Personal Information:</strong> Name, email, phone number when you register or contact us</li>
              <li><strong>Prayer Requests:</strong> Information you voluntarily share for prayer support</li>
              <li><strong>Event Participation:</strong> Records of events you attend or register for</li>
              <li><strong>Usage Data:</strong> How you interact with our website for improvement purposes</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <ul>
              <li>Provide church services and communications</li>
              <li>Send updates about church activities and events</li>
              <li>Respond to your prayer requests and inquiries</li>
              <li>Improve our website and services</li>
              <li>Maintain church records as required by our denomination</li>
            </ul>

            <h2>Information Sharing</h2>
            <p>We do not sell, trade, or rent your personal information. We may share information only:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>For church directory purposes (with member consent)</li>
              <li>When required by law</li>
              <li>To protect the safety of our congregation</li>
            </ul>

            <h2>Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of communications</li>
              <li>Download a copy of your data</li>
            </ul>

            <h2>Cookies and Tracking</h2>
            <p>We use cookies to enhance your browsing experience. You can manage cookie preferences through our privacy settings.</p>

            <h2>Children's Privacy</h2>
            <p>We take special care with information from children under 13. Parental consent is required for any data collection from minors.</p>

            <h2>Data Retention</h2>
            <p>We retain your information for as long as necessary to provide services or as required by church governance and legal obligations.</p>

            <h2>Contact Us</h2>
            <p>For privacy-related questions or requests, contact us at:</p>
            <ul>
              <li>Email: privacy@salemprimitivebaptist.org</li>
              <li>Phone: (555) 123-4567</li>
              <li>Address: 123 Church Street, Your City, State 12345</li>
            </ul>

            <h2>Changes to This Policy</h2>
            <p>We may update this privacy policy periodically. We will notify you of any material changes via email or website notice.</p>
          </div>
        </div>
      </div>
    </div>
  );
}