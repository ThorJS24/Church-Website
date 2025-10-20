const verses = [
  {
    english: "Come to me, all you who are weary and burdened, and I will give you rest.",
    reference: "Matthew 11:28",
    tamil: "வருத்தப்பட்டுப் பாரஞ்சுமக்கிறவர்களே! நீங்கள் எல்லாரும் என்னிடத்தில் வாருங்கள்; நான் உங்களுக்கு இளைப்பாறுதல் தருவேன்.",
    tamilReference: "மத்தேயு 11:28"
  },
  {
    english: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    reference: "John 3:16",
    tamil: "தேவன் உலகத்தை இவ்வளவாய் அன்புகூர்ந்தார்; தம்முடைய ஒரே பேறான குமாரனை விசுவாசிக்கிறவன் எவனோ அவன் கெட்டுப்போகாமல் நித்தியஜீவனை அடையும்படிக்கு அவரைக் கொடுத்தார்.",
    tamilReference: "யோவான் 3:16"
  },
  {
    english: "Trust in the Lord with all your heart and lean not on your own understanding.",
    reference: "Proverbs 3:5",
    tamil: "உன் முழு இருதயத்தோடும் கர்த்தரில் நம்பிக்கையாயிரு; உன் புத்தியின்மேல் சாயாதே.",
    tamilReference: "நீதிமொழிகள் 3:5"
  }
];

export function getRandomVerse() {
  return verses[Math.floor(Math.random() * verses.length)];
}