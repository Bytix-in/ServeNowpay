'use client'

import { useState } from 'react'
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  MessageCircle,
  Globe,
  Book,
  Search,
  ExternalLink
} from 'lucide-react'

type Language = 'en' | 'hi' | 'or'

interface FAQ {
  id: string
  question: {
    en: string
    hi: string
    or: string
  }
  answer: {
    en: string
    hi: string
    or: string
  }
  category: string
}

interface GuideSection {
  id: string
  title: {
    en: string
    hi: string
    or: string
  }
  content: {
    en: string
    hi: string
    or: string
  }
}

const translations = {
  en: {
    title: 'Support Center',
    subtitle: 'Get help with your restaurant panel',
    searchPlaceholder: 'Search for help...',
    faqsTitle: 'Frequently Asked Questions',
    guidesTitle: 'Restaurant Panel Guide',
    contactTitle: 'Contact Support',
    contactSubtitle: 'Still need help? Get in touch with our support team',
    emailSupport: 'Email Support',
    phoneSupport: 'Phone Support',
    liveChat: 'Live Chat',
    categories: {
      orders: 'Orders Management',
      menu: 'Menu Management',
      payments: 'Payments',
      general: 'General',
      technical: 'Technical Issues'
    }
  },
  hi: {
    title: 'सहायता केंद्र',
    subtitle: 'अपने रेस्टोरेंट पैनल के साथ सहायता प्राप्त करें',
    searchPlaceholder: 'सहायता खोजें...',
    faqsTitle: 'अक्सर पूछे जाने वाले प्रश्न',
    guidesTitle: 'रेस्टोरेंट पैनल गाइड',
    contactTitle: 'सहायता से संपर्क करें',
    contactSubtitle: 'अभी भी सहायता चाहिए? हमारी सहायता टीम से संपर्क करें',
    emailSupport: 'ईमेल सहायता',
    phoneSupport: 'फोन सहायता',
    liveChat: 'लाइव चैट',
    categories: {
      orders: 'ऑर्डर प्रबंधन',
      menu: 'मेनू प्रबंधन',
      payments: 'भुगतान',
      general: 'सामान्य',
      technical: 'तकनीकी समस्याएं'
    }
  },
  or: {
    title: 'ସହାୟତା କେନ୍ଦ୍ର',
    subtitle: 'ଆପଣଙ୍କ ରେଷ୍ଟୁରାଣ୍ଟ ପ୍ୟାନେଲ ସହିତ ସହାୟତା ପାଆନ୍ତୁ',
    searchPlaceholder: 'ସହାୟତା ଖୋଜନ୍ତୁ...',
    faqsTitle: 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ',
    guidesTitle: 'ରେଷ୍ଟୁରାଣ୍ଟ ପ୍ୟାନେଲ ଗାଇଡ',
    contactTitle: 'ସହାୟତା ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ',
    contactSubtitle: 'ତଥାପି ସହାୟତା ଦରକାର? ଆମର ସହାୟତା ଦଳ ସହିତ ଯୋଗାଯୋଗ କରନ୍ତୁ',
    emailSupport: 'ଇମେଲ ସହାୟତା',
    phoneSupport: 'ଫୋନ ସହାୟତା',
    liveChat: 'ଲାଇଭ ଚାଟ',
    categories: {
      orders: 'ଅର୍ଡର ପରିଚାଳନା',
      menu: 'ମେନୁ ପରିଚାଳନା',
      payments: 'ପେମେଣ୍ଟ',
      general: 'ସାଧାରଣ',
      technical: 'ଯାନ୍ତ୍ରିକ ସମସ୍ୟା'
    }
  }
}

const faqs: FAQ[] = [
  {
    id: '1',
    category: 'orders',
    question: {
      en: 'How do I view and manage incoming orders?',
      hi: 'मैं आने वाले ऑर्डर कैसे देखूं और प्रबंधित करूं?',
      or: 'ମୁଁ କିପରି ଆସୁଥିବା ଅର୍ଡର ଦେଖିବି ଏବଂ ପରିଚାଳନା କରିବି?'
    },
    answer: {
      en: 'Go to the Orders section in your dashboard. You\'ll see all incoming orders with their status. Click on any order to view details, update status (Preparing, Ready, Delivered), and manage the order lifecycle. You\'ll receive real-time notifications for new orders.',
      hi: 'अपने डैशबोर्ड में ऑर्डर सेक्शन में जाएं। आपको उनकी स्थिति के साथ सभी आने वाले ऑर्डर दिखाई देंगे। विवरण देखने, स्थिति अपडेट करने (तैयार कर रहे हैं, तैयार, वितरित), और ऑर्डर जीवनचक्र प्रबंधित करने के लिए किसी भी ऑर्डर पर क्लिक करें। आपको नए ऑर्डर के लिए रियल-टाइम नोटिफिकेशन मिलेंगे।',
      or: 'ଆପଣଙ୍କ ଡ୍ୟାସବୋର୍ଡରେ ଅର୍ଡର ବିଭାଗକୁ ଯାଆନ୍ତୁ। ଆପଣ ସେମାନଙ୍କର ସ୍ଥିତି ସହିତ ସମସ୍ତ ଆସୁଥିବା ଅର୍ଡର ଦେଖିବେ। ବିବରଣୀ ଦେଖିବା, ସ୍ଥିତି ଅପଡେଟ କରିବା (ପ୍ରସ୍ତୁତ କରୁଛି, ପ୍ରସ୍ତୁତ, ବିତରଣ), ଏବଂ ଅର୍ଡର ଜୀବନଚକ୍ର ପରିଚାଳନା କରିବା ପାଇଁ ଯେକୌଣସି ଅର୍ଡରରେ କ୍ଲିକ କରନ୍ତୁ।'
    }
  },
  {
    id: '2',
    category: 'menu',
    question: {
      en: 'How do I add or edit menu items?',
      hi: 'मैं मेनू आइटम कैसे जोड़ूं या संपादित करूं?',
      or: 'ମୁଁ କିପରି ମେନୁ ଆଇଟମ ଯୋଡ଼ିବି କିମ୍ବା ସଂପାଦନ କରିବି?'
    },
    answer: {
      en: 'Navigate to the Food Menu section. Click "Add New Item" to create a new dish. Fill in the dish name, description, price, category, and upload an image. To edit existing items, click the edit icon next to any menu item. You can also mark items as available/unavailable without deleting them.',
      hi: 'फूड मेनू सेक्शन में जाएं। नया डिश बनाने के लिए "नया आइटम जोड़ें" पर क्लिक करें। डिश का नाम, विवरण, कीमत, श्रेणी भरें और एक छवि अपलोड करें। मौजूदा आइटम संपादित करने के लिए, किसी भी मेनू आइटम के बगल में संपादित आइकन पर क्लिक करें।',
      or: 'ଫୁଡ ମେନୁ ବିଭାଗକୁ ଯାଆନ୍ତୁ। ନୂତନ ଖାଦ୍ୟ ସୃଷ୍ଟି କରିବା ପାଇଁ "ନୂତନ ଆଇଟମ ଯୋଡ଼ନ୍ତୁ" କ୍ଲିକ କରନ୍ତୁ। ଖାଦ୍ୟର ନାମ, ବର୍ଣ୍ଣନା, ମୂଲ୍ୟ, ବର୍ଗ ପୂରଣ କରନ୍ତୁ ଏବଂ ଏକ ଛବି ଅପଲୋଡ କରନ୍ତୁ।'
    }
  },
  {
    id: '3',
    category: 'payments',
    question: {
      en: 'How do I track payments and revenue?',
      hi: 'मैं भुगतान और राजस्व को कैसे ट्रैक करूं?',
      or: 'ମୁଁ କିପରି ପେମେଣ୍ଟ ଏବଂ ରାଜସ୍ୱ ଟ୍ରାକ କରିବି?'
    },
    answer: {
      en: 'Visit the Payments section to view all transaction history, daily/weekly/monthly revenue reports, and payment status for each order. You can filter by date range, payment method, and export reports for accounting purposes. Failed payments are highlighted for easy identification.',
      hi: 'सभी लेनदेन इतिहास, दैनिक/साप्ताहिक/मासिक राजस्व रिपोर्ट, और प्रत्येक ऑर्डर के लिए भुगतान स्थिति देखने के लिए भुगतान अनुभाग पर जाएं। आप दिनांक सीमा, भुगतान विधि द्वारा फ़िल्टर कर सकते हैं और लेखांकन उद्देश्यों के लिए रिपोर्ट निर्यात कर सकते हैं।',
      or: 'ସମସ୍ତ ଲେଣଦେଣ ଇତିହାସ, ଦୈନିକ/ସାପ୍ତାହିକ/ମାସିକ ରାଜସ୍ୱ ରିପୋର୍ଟ, ଏବଂ ପ୍ରତ୍ୟେକ ଅର୍ଡର ପାଇଁ ପେମେଣ୍ଟ ସ୍ଥିତି ଦେଖିବା ପାଇଁ ପେମେଣ୍ଟ ବିଭାଗକୁ ଯାଆନ୍ତୁ।'
    }
  },
  {
    id: '4',
    category: 'general',
    question: {
      en: 'How do I update my restaurant information?',
      hi: 'मैं अपनी रेस्टोरेंट की जानकारी कैसे अपडेट करूं?',
      or: 'ମୁଁ କିପରି ମୋର ରେଷ୍ଟୁରାଣ୍ଟ ସୂଚନା ଅପଡେଟ କରିବି?'
    },
    answer: {
      en: 'Click on Settings in the sidebar, then go to Restaurant Profile. Here you can update your restaurant name, address, contact information, operating hours, cuisine type, and upload a new logo. Changes are saved automatically and reflected on your customer-facing menu immediately.',
      hi: 'साइडबार में सेटिंग्स पर क्लिक करें, फिर रेस्टोरेंट प्रोफाइल पर जाएं। यहां आप अपना रेस्टोरेंट नाम, पता, संपर्क जानकारी, संचालन घंटे, व्यंजन प्रकार अपडेट कर सकते हैं और नया लोगो अपलोड कर सकते हैं।',
      or: 'ସାଇଡବାରରେ ସେଟିଂସରେ କ୍ଲିକ କରନ୍ତୁ, ତାପରେ ରେଷ୍ଟୁରାଣ୍ଟ ପ୍ରୋଫାଇଲକୁ ଯାଆନ୍ତୁ। ଏଠାରେ ଆପଣ ଆପଣଙ୍କର ରେଷ୍ଟୁରାଣ୍ଟ ନାମ, ଠିକଣା, ଯୋଗାଯୋଗ ସୂଚନା ଅପଡେଟ କରିପାରିବେ।'
    }
  },
  {
    id: '5',
    category: 'technical',
    question: {
      en: 'What should I do if I\'m not receiving order notifications?',
      hi: 'यदि मुझे ऑर्डर नोटिफिकेशन नहीं मिल रहे हैं तो मुझे क्या करना चाहिए?',
      or: 'ଯଦି ମୁଁ ଅର୍ଡର ବିଜ୍ଞପ୍ତି ପାଇନାହିଁ ତେବେ ମୁଁ କଣ କରିବି?'
    },
    answer: {
      en: 'First, check your browser notification settings and ensure they\'re enabled for this website. Refresh your browser and check your internet connection. If the issue persists, try logging out and logging back in. For persistent issues, contact our technical support team.',
      hi: 'पहले, अपनी ब्राउज़र नोटिफिकेशन सेटिंग्स जांचें और सुनिश्चित करें कि वे इस वेबसाइट के लिए सक्षम हैं। अपना ब्राउज़र रीफ्रेश करें और अपना इंटरनेट कनेक्शन जांचें। यदि समस्या बनी रहती है, तो लॉग आउट करके वापस लॉग इन करने का प्रयास करें।',
      or: 'ପ୍ରଥମେ, ଆପଣଙ୍କର ବ୍ରାଉଜର ବିଜ୍ଞପ୍ତି ସେଟିଂସ ଯାଞ୍ଚ କରନ୍ତୁ ଏବଂ ନିଶ୍ଚିତ କରନ୍ତୁ ଯେ ସେମାନେ ଏହି ୱେବସାଇଟ ପାଇଁ ସକ୍ଷମ ଅଛନ୍ତି।'
    }
  }
]

const guides: GuideSection[] = [
  {
    id: 'getting-started',
    title: {
      en: 'Getting Started with Your Restaurant Panel',
      hi: 'अपने रेस्टोरेंट पैनल के साथ शुरुआत करना',
      or: 'ଆପଣଙ୍କର ରେଷ୍ଟୁରାଣ୍ଟ ପ୍ୟାନେଲ ସହିତ ଆରମ୍ଭ କରିବା'
    },
    content: {
      en: 'Welcome to ServeNow! Your restaurant panel is your central hub for managing all operations. Start by setting up your menu items, configuring your restaurant profile, and familiarizing yourself with the order management system. The dashboard provides real-time insights into your business performance.',
      hi: 'ServeNow में आपका स्वागत है! आपका रेस्टोरेंट पैनल सभी संचालन प्रबंधित करने के लिए आपका केंद्रीय हब है। अपने मेनू आइटम सेट करके, अपनी रेस्टोरेंट प्रोफाइल कॉन्फ़िगर करके, और ऑर्डर प्रबंधन सिस्टम से परिचित होकर शुरुआत करें।',
      or: 'ServeNow ରେ ସ୍ୱାଗତ! ଆପଣଙ୍କର ରେଷ୍ଟୁରାଣ୍ଟ ପ୍ୟାନେଲ ସମସ୍ତ କାର୍ଯ୍ୟ ପରିଚାଳନା ପାଇଁ ଆପଣଙ୍କର କେନ୍ଦ୍ରୀୟ ହବ ଅଟେ।'
    }
  },
  {
    id: 'order-management',
    title: {
      en: 'Managing Orders Efficiently',
      hi: 'ऑर्डर को कुशलतापूर्वक प्रबंधित करना',
      or: 'ଅର୍ଡରଗୁଡ଼ିକୁ ଦକ୍ଷତାର ସହିତ ପରିଚାଳନା କରିବା'
    },
    content: {
      en: 'Efficient order management is key to customer satisfaction. When you receive an order, acknowledge it immediately by updating the status to "Preparing". Keep customers informed by updating status to "Ready" when the order is complete. Use the order details view to see special instructions and customer preferences.',
      hi: 'कुशल ऑर्डर प्रबंधन ग्राहक संतुष्टि की कुंजी है। जब आपको कोई ऑर्डर मिले, तो स्थिति को "तैयार कर रहे हैं" में अपडेट करके तुरंत इसे स्वीकार करें। जब ऑर्डर पूरा हो जाए तो स्थिति को "तैयार" में अपडेट करके ग्राहकों को सूचित रखें।',
      or: 'ଦକ୍ଷ ଅର୍ଡର ପରିଚାଳନା ଗ୍ରାହକ ସନ୍ତୁଷ୍ଟିର ଚାବି ଅଟେ। ଯେତେବେଳେ ଆପଣ ଏକ ଅର୍ଡର ପାଆନ୍ତି, ସ୍ଥିତିକୁ "ପ୍ରସ୍ତୁତ କରୁଛି" ରେ ଅପଡେଟ କରି ତୁରନ୍ତ ଏହାକୁ ସ୍ୱୀକାର କରନ୍ତୁ।'
    }
  },
  {
    id: 'menu-optimization',
    title: {
      en: 'Menu Management Best Practices',
      hi: 'मेनू प्रबंधन की सर्वोत्तम प्रथाएं',
      or: 'ମେନୁ ପରିଚାଳନା ସର୍ବୋତ୍ତମ ଅଭ୍ୟାସ'
    },
    content: {
      en: 'Keep your menu updated and appealing. Use high-quality images for all dishes, write detailed descriptions that highlight ingredients and preparation methods. Organize items into clear categories. Regularly review and update prices. Mark items as unavailable rather than deleting them when temporarily out of stock.',
      hi: 'अपने मेनू को अपडेटेड और आकर्षक रखें। सभी व्यंजनों के लिए उच्च गुणवत्ता वाली छवियों का उपयोग करें, विस्तृत विवरण लिखें जो सामग्री और तैयारी के तरीकों को उजागर करें। आइटम को स्पष्ट श्रेणियों में व्यवस्थित करें।',
      or: 'ଆପଣଙ୍କର ମେନୁକୁ ଅପଡେଟ ଏବଂ ଆକର୍ଷଣୀୟ ରଖନ୍ତୁ। ସମସ୍ତ ଖାଦ୍ୟ ପାଇଁ ଉଚ୍ଚ ଗୁଣବତ୍ତା ଛବି ବ୍ୟବହାର କରନ୍ତୁ।'
    }
  }
]

export default function SupportPage() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const t = translations[currentLanguage]

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question[currentLanguage].toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer[currentLanguage].toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'orders', 'menu', 'payments', 'general', 'technical']

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-gray-600 mt-2">{t.subtitle}</p>
            </div>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-500" />
              <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value as Language)}
                className="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="or">ଓଡ଼ିଆ</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQs Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-6 h-6 text-green-600" />
                  <h2 className="text-2xl font-bold text-gray-900">{t.faqsTitle}</h2>
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                        selectedCategory === category
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {category === 'all' ? 'All' : t.categories[category as keyof typeof t.categories]}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredFAQs.map((faq) => (
                  <div key={faq.id} className="p-6">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                      className="w-full text-left flex justify-between items-center"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question[currentLanguage]}
                      </h3>
                      {expandedFAQ === faq.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    {expandedFAQ === faq.id && (
                      <div className="mt-4 text-gray-600 leading-relaxed">
                        {faq.answer[currentLanguage]}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Guides Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Book className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900">{t.guidesTitle}</h2>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {guides.map((guide) => (
                  <div key={guide.id} className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {guide.title[currentLanguage]}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {guide.content[currentLanguage]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Support */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.contactTitle}</h3>
              <p className="text-gray-600 mb-6">{t.contactSubtitle}</p>
              
              <div className="space-y-4">
                <a
                  href="mailto:bytixcompany@gmail.com"
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                >
                  <Mail className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">{t.emailSupport}</div>
                    <div className="text-sm text-gray-600">bytixcompany@gmail.com</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
                
                <a
                  href="tel:+918521736139"
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition"
                >
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">{t.phoneSupport}</div>
                    <div className="text-sm text-gray-600">+91 85217 36139</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </a>
                
                <button className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition w-full">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{t.liveChat}</div>
                    <div className="text-sm text-gray-600">Available 24/7</div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}