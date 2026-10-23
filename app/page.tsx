'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import {
  auth,
  db,
  loginWithGoogle,
  logoutUser,
  testConnection,
  handleFirestoreError,
  OperationType
} from '@/lib/firebase';
import {
  BookOpen,
  Play,
  Plus,
  Check,
  Search,
  Star,
  ChevronRight,
  ChevronLeft,
  X,
  PenTool,
  Bookmark,
  Share2,
  Clock,
  ThumbsUp,
  Sliders,
  Type,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Eye,
  Layers,
  Flame,
  ArrowRight,
  LogIn,
  LogOut,
  User as UserIcon,
  Cloud
} from 'lucide-react';

interface Chapter {
  id: number;
  number: number;
  title: string;
  readTime: string;
  content: string;
  publishedDate: string;
}

interface Novel {
  id: string;
  title: string;
  originalTitle?: string;
  author: string;
  authorId?: string;
  createdAt?: string;
  coverImage: string;
  rating: number;
  ratingCount: number;
  views: string;
  genre: 'Фантази' | 'Адал явдалт' | 'Хайр дурлал' | 'Нууцлаг' | 'Шинжлэх ухаан';
  ageLimit: string;
  status: 'Шинэчлэгдэж буй' | 'Бүрэн дууссан';
  synopsis: string;
  isTrending?: boolean;
  isNew?: boolean;
  rank?: number;
  chapters: Chapter[];
}

const INITIAL_NOVELS: Novel[] = [
  {
    id: 'novel-1',
    title: 'Мөнхийн Титмийн Домог',
    originalTitle: 'Legend of the Eternal Crown',
    author: 'Б. Тэмүүлэн',
    coverImage: '/images/hero.jpg',
    rating: 4.9,
    ratingCount: 28420,
    views: '482K',
    genre: 'Фантази',
    ageLimit: '16+',
    status: 'Шинэчлэгдэж буй',
    isTrending: true,
    rank: 1,
    synopsis: 'Эртний хаант улсуудын мөхлийн дараа харанхуйн хүч сэрж, дэлхийн хувь тавиланг шийдэх мөнхийн титэм алга болно. Ганц цэрэг эр өөрийн цусан төрлийн нууцыг нээж, хүн төрөлхтнийг хамгаалах сүүлчийн аян дайнд мордоно.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Аянгын дундах дуудлага',
        readTime: '7 мин',
        publishedDate: '2026.04.10',
        content: `Үүлс тэнгэрийн хаяаг халхлан хар хилэн мэт хүндээр дарахад, уулын бэл дэх эртний цайз аянгат салхины хүчинд хүнгэнэн чичирч байв. 

Кай сэлмээ гартаа чанга атган өндөр хадан хясааны ирмэг дээр зогсоно. Доорх хөндийд үл мэдэгдэх манан дунд хэдэн мянган бамбарын гэрэл анивчин урагшилж байлаа. Тэр бол харанхуйн хааны анхны цэргийн анги. 

"Хэрэв бид энэ шөнө хаалгыг алдвал, маргаашийн нарыг хэн ч харахгүй," хэмээн ард зогсох ахмад дайчин өгүүлэв.

Кай эргэж харалгүйгээр сэлмээ дээш өргөлөө. Түүний сэлэмний дагуу эртний руны цэнхэр гэрэл сүүмэлзэн асч, огторгуйн хүйтэн ододтой нэгэн жигд хэмнэлээр лугшиж эхлэв. Энэ бол энгийн нэгэн зэвсэг биш, өвөг дээдсийн хараалыг ч, адислалыг ч өөртөө тээсэн цор ганц тэнгэрлэг ир байлаа.`
      },
      {
        id: 2,
        number: 2,
        title: 'Бүлэг 2: Сүүдрийн цэрэг',
        readTime: '9 мин',
        publishedDate: '2026.04.12',
        content: `Манангийн дундаас гарч ирсэн дайчид хүний төрхгүй байлаа. Тэдний нүдэнд амьд сүнсний ямар ч оч үгүй, зөвхөн өлсгөлөн хар энерги л дүүрэн асч байв. 

Кай урагш нэг алхан үсрээд эхний сүүдрийг хоёр хуваав. Гэвч хуваагдсан бие нь хоромхон зуур хар утаа болон сарниж, хэдэн секундын дараа дахин нэгдэх нь тэр.

"Тэднийг зөвхөн тэнгэрийн галаар л устгаж чадна!" хэмээн цайзын оройгоос шидтэн охин хашгирлаа. Тэр мөчид тэнгэрт үлэмж том гэрлийн тойрог зурагдаж, эртний сахиусны нууц тайлагдаж эхлэв.`
      },
      {
        id: 3,
        number: 3,
        title: 'Бүлэг 3: Хааны нууц гэрээслэл',
        readTime: '8 мин',
        publishedDate: '2026.04.15',
        content: `Тулааны дуу түр намжиж, өглөөний хүйтэн жавар цайзын ханан дээгүүр мөлхөнө. Эвдэрсэн хаалганы цаанаас нэгэн хуучин хайрцаг олдсон нь талийгаач эзэн хааны хувийн тамгатай лацаар хамгаалагдсан байв.

Тэмүүлэн хайрцгийг нээхэд шарласан илгэн цаасан дээр цус шиг тод бэхээр бичсэн үгс тодорлоо: "Хэрэв чи үүнийг уншиж байгаа бол, бидний мэддэг ертөнц аль хэдийн сүйрсэн байна..."`
      }
    ]
  },
  {
    id: 'novel-2',
    title: 'Одон Сэлэмт Аялагч',
    originalTitle: 'The Runic Stargazer',
    author: 'А. Сэргэлэн',
    coverImage: '/images/fantasy.jpg',
    rating: 4.8,
    ratingCount: 19300,
    views: '320K',
    genre: 'Фантази',
    ageLimit: '13+',
    status: 'Шинэчлэгдэж буй',
    isTrending: true,
    rank: 2,
    synopsis: 'Огторгуйн одод байрлалаа өөрчлөх өдөр энгийн нэгэн сургуулийн хүү селестиал ертөнцөд сэрнэ. Түүний гарт гэрэлтэх эртний одон сэлэм долоон хаант улсыг нэгтгэх түлхүүр байв.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Одод унасан шөнө',
        readTime: '6 мин',
        publishedDate: '2026.04.05',
        content: `Тэр өдөр тэнгэр цэнхэр биш, харин гүн ягаан туяатай байв. Шөнийн 12 цагт одод ердийнх шигээ хөдөлгөөнгүй байхаа больж, бүжиглэх мэт тойрог зам үүсгэлээ.

"Энэ бол эхлэл," хэмээн эмээ нь хэлдэг байсан үлгэр бодит болохыг хүү тэр хоромд л ойлгосон юм.`
      },
      {
        id: 2,
        number: 2,
        title: 'Бүлэг 2: Сэрэхүйн шалгуур',
        readTime: '8 мин',
        publishedDate: '2026.04.08',
        content: `Цагаан сүмбэр уулын бэлд тэр сэрлээ. Агаар нь цэвэр тунгалаг, цээж дүүрэн амьсгалахад дотоод хүч нь сэрж байгаа мэт хачин сайхан мэдрэмж төрнө.`
      }
    ]
  },
  {
    id: 'novel-3',
    title: 'Бороот Шөнийн Мөрдөгч',
    originalTitle: 'Night Rain: Noir Future',
    author: 'Г. Бат-Эрдэнэ',
    coverImage: '/images/noir.jpg',
    rating: 4.9,
    ratingCount: 15400,
    views: '260K',
    genre: 'Нууцлаг',
    ageLimit: '18+',
    status: 'Шинэчлэгдэж буй',
    isTrending: true,
    rank: 3,
    synopsis: '2088 оны неон гэрэлт их хотын хүйтэн бороон дунд хэн ч шийдэж зүрхлээгүй цуврал аллагуудыг хувийн мөрдөгч Макс мөрдөнө. Үнэн илрэх тусам түүний өнгөрсөн үе аюулд орно.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Неон гэрэл ба цусан мөр',
        readTime: '10 мин',
        publishedDate: '2026.04.02',
        content: `Хотын 42-р тойрог үргэлж нойтон байдаг. Хүчиллэг бороо неон самбаруудын тусгалыг асфальтан дээр нялж, хотын бүдэг бадаг нүүр царайг улам бүр өнгөгүй болгоно.

Макс цувныхаа захыг өргөөд тамхи асаав. Хэргийн газар аль хэдийн шар туузаар хүрээлэгдсэн байлаа. Гэвч энэ удаа цагдаа нар биш, харин хотын хамгийн хүчирхэг корпорацийн тусгай албаныхан зогсож байв.`
      }
    ]
  },
  {
    id: 'novel-4',
    title: 'Намрын Алтан Гудамж',
    originalTitle: 'Falling into Us',
    author: 'М. Эгшиглэн',
    coverImage: '/images/romance.jpg',
    rating: 4.7,
    ratingCount: 22100,
    views: '410K',
    genre: 'Хайр дурлал',
    ageLimit: '13+',
    status: 'Бүрэн дууссан',
    isTrending: true,
    rank: 4,
    synopsis: 'Олон жилийн дараа төрөлх хотдоо эргэн ирсэн төгөлдөр хуурч залуу, хуучин номын сангийн эрхлэгч бүсгүйтэй бороотой намрын өдөр дахин учрахдаа зүрхэндээ нуусан нандин дурсамжаа сэргээнэ.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Шүхрийн доорх дурсамж',
        readTime: '6 мин',
        publishedDate: '2026.03.20',
        content: `Шарласан навчис явган хүний замаар салхинд хийсч, агаарт чийглэг модны үнэр сэнгэнэнэ. Тэр яг л арван жилийн өмнөх шигээ ногоон шүхэртэй алхаж явлаа.`
      }
    ]
  },
  {
    id: 'novel-5',
    title: 'Тэнгэрийн Сүүлчийн Бөө',
    author: 'Д. Цогтбаатар',
    coverImage: '/images/fantasy.jpg',
    rating: 4.85,
    ratingCount: 14200,
    views: '190K',
    genre: 'Адал явдалт',
    ageLimit: '16+',
    status: 'Шинэчлэгдэж буй',
    isTrending: true,
    rank: 5,
    synopsis: 'Хөвсгөлийн тайгын гүнд нуугдсан эртний сүнснүүд сэрж, орчин үеийн ертөнцтэй холбогдох хаалга нээгдэнэ. Эцсийн бөө хүү хоёр ертөнцийн тэнцвэрийг хадгалахын тулд тэмцэнэ.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Хэнгэргийн дуун',
        readTime: '8 мин',
        publishedDate: '2026.04.14',
        content: `Тайгын шөнө тас харанхуй. Ганцхан асаасан галын туяанд хэнгэргийн хэмнэл хүнгэнэнэ. Салхи хүртэл тэр дуунд захирагдах мэт навчсаа хөдөлгөхөө болив.`
      }
    ]
  },
  {
    id: 'novel-6',
    title: 'Улаанбаатар 2099: Кибер Сүлжээ',
    author: 'Э. Мөнхболд',
    coverImage: '/images/noir.jpg',
    rating: 4.6,
    ratingCount: 9800,
    views: '145K',
    genre: 'Шинжлэх ухаан',
    ageLimit: '16+',
    status: 'Шинэчлэгдэж буй',
    synopsis: 'Утаа манангаас ангижирсан шинэ үеийн аварга хотод хиймэл оюун ухаан бүхнийг хянаж байв. Гэвч хүний сэтгэл хөдлөлийг хуулбарласан вирус сүлжээнд тархаж эхэлнэ.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Кодлогдсон сэтгэл',
        readTime: '7 мин',
        publishedDate: '2026.04.01',
        content: `Дэлгэц дээрх ногоон тэмдэгтүүд ус урсах мэт асгарна. Хиймэл оюун ухааны төв серверээс анх удаа "Би өвдөж байна" гэсэн мессеж иржээ.`
      }
    ]
  },
  {
    id: 'novel-7',
    title: 'Сүүлчийн Хатан Хааны Сүлд',
    author: 'С. Уранбилэг',
    coverImage: '/images/hero.jpg',
    rating: 4.92,
    ratingCount: 31000,
    views: '540K',
    genre: 'Адал явдалт',
    ageLimit: '13+',
    status: 'Бүрэн дууссан',
    synopsis: 'XIII зууны дайны хөл үймээн дунд төрсөн эрэлхэг бүсгүйн хувь тавилан, төрийн төлөөх зоригт алхмууд болон нууцлаг хайрын тухай түүхэн баатарлаг зохиол.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Нум сумны исгэрээ',
        readTime: '9 мин',
        publishedDate: '2026.03.15',
        content: `Талын салхи дэл сүүлээ задгайлсан хүлгүүдийн хөлөөр боссон шороог агаарт эргэлдүүлнэ. Бүсгүй нумаа эвшээлгэн татахад харвасан сум байг яг голд нь онолоо.`
      }
    ]
  },
  {
    id: 'novel-8',
    title: 'Анхны Хайрын Давталт',
    author: 'Х. Номин',
    coverImage: '/images/romance.jpg',
    rating: 4.75,
    ratingCount: 16800,
    views: '280K',
    genre: 'Хайр дурлал',
    ageLimit: '13+',
    status: 'Шинэчлэгдэж буй',
    synopsis: 'Цаг хугацаагаар аялах боломжтой болсон оюутан залуу өнгөрсөн үе рүү буцаж, сургуулийн ширээний анхны хайртайгаа дахин учирч хувь заяагаа өөрчлөхөөр шийднэ.',
    chapters: [
      {
        id: 1,
        number: 1,
        title: 'Бүлэг 1: Хуучин хонхны дуу',
        readTime: '6 мин',
        publishedDate: '2026.04.18',
        content: `Нүдээ нээхэд арван жилийн өмнөх ангийн өрөө байлаа. Самбар дээрх шохойн үнэр, хажуугийн ширээнд суух охины инээмсэглэл бүх зүйл хэвээрээ.`
      }
    ]
  }
];

export default function NovelFlixHome() {
  // Firebase Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Application states
  const [novels, setNovels] = useState<Novel[]>(INITIAL_NOVELS);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [readingNovel, setReadingNovel] = useState<Novel | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [myList, setMyList] = useState<string[]>(['novel-1', 'novel-4']);
  const [activeTab, setActiveTab] = useState<'home' | 'all' | 'top10' | 'mylist' | 'plans'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('Бүгд');

  // Creator studio modal
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState<'Фантази' | 'Адал явдалт' | 'Хайр дурлал' | 'Нууцлаг' | 'Шинжлэх ухаан'>('Фантази');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newCover, setNewCover] = useState('/images/fantasy.jpg');
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterContent, setNewChapterContent] = useState('');
  const [publishSuccessToast, setPublishSuccessToast] = useState(false);

  // VIP Subscription state
  const [subscriptionModal, setSubscriptionModal] = useState<string | null>(null);
  const [subscribedPlan, setSubscribedPlan] = useState<string | null>(null);

  // Reader customization state
  const [readerFontSize, setReaderFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [readerTheme, setReaderTheme] = useState<'dark' | 'sepia' | 'black'>('dark');

  // Newsletter lead capture
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);

  // 1. Firebase Initial Connection Test & Auth State Listener
  useEffect(() => {
    // Validate connection to Firestore as required by skill
    testConnection().then(() => {
      setIsFirebaseConnected(true);
    }).catch(() => {
      setIsFirebaseConnected(false);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            await setDoc(userDocRef, {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Уншигч',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              vipPlan: 'Үнэгүй',
              createdAt: new Date().toISOString()
            });
          } else {
            const data = snap.data();
            if (data?.vipPlan && data.vipPlan !== 'Үнэгүй') {
              setSubscribedPlan(data.vipPlan);
            }
          }
        } catch (err) {
          console.error('Error syncing user profile:', err);
        }
      }
    });

    // 2. Real-time Firestore sync for Novels
    const novelsColRef = collection(db, 'novels');
    const unsubscribeNovels = onSnapshot(novelsColRef, async (snapshot) => {
      if (snapshot.empty) {
        // Seed initial novels into Firestore on first launch
        try {
          for (const item of INITIAL_NOVELS) {
            await setDoc(doc(db, 'novels', item.id), {
              ...item,
              authorId: 'system',
              createdAt: new Date().toISOString()
            });
          }
        } catch (seedErr) {
          console.warn('Initial seeding note:', seedErr);
        }
      } else {
        const firestoreNovels: Novel[] = snapshot.docs.map(docSnap => docSnap.data() as Novel);
        setNovels(firestoreNovels);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'novels');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeNovels();
    };
  }, []);

  // 3. Sync User Bookmarks from Firestore when signed in
  useEffect(() => {
    if (!user) return;
    const bookmarksColRef = collection(db, 'users', user.uid, 'bookmarks');
    const unsubscribeBookmarks = onSnapshot(bookmarksColRef, (snapshot) => {
      const ids = snapshot.docs.map(d => d.id);
      if (ids.length > 0) {
        setMyList(ids);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/bookmarks`);
    });

    return () => unsubscribeBookmarks();
  }, [user]);

  // Filter novels
  const filteredNovels = useMemo(() => {
    return novels.filter(novel => {
      const matchesSearch =
        novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        novel.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (novel.originalTitle && novel.originalTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesGenre = selectedGenre === 'Бүгд' || novel.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    });
  }, [novels, searchQuery, selectedGenre]);

  // Specific rows
  const trendingNovels = useMemo(() => novels.filter(n => n.isTrending).sort((a, b) => (a.rank || 99) - (b.rank || 99)), [novels]);
  const fantasyNovels = useMemo(() => novels.filter(n => n.genre === 'Фантази'), [novels]);
  const romanceNovels = useMemo(() => novels.filter(n => n.genre === 'Хайр дурлал'), [novels]);
  const mysteryNovels = useMemo(() => novels.filter(n => n.genre === 'Нууцлаг' || n.genre === 'Шинжлэх ухаан'), [novels]);
  const myListNovels = useMemo(() => novels.filter(n => myList.includes(n.id)), [novels, myList]);

  const toggleMyList = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const isCurrentlySaved = myList.includes(id);

    // Optimistic UI state
    setMyList(prev =>
      isCurrentlySaved ? prev.filter(item => item !== id) : [...prev, id]
    );

    // Persist to Firestore if user is authenticated
    if (user) {
      const bookmarkRef = doc(db, 'users', user.uid, 'bookmarks', id);
      try {
        if (isCurrentlySaved) {
          await deleteDoc(bookmarkRef);
        } else {
          const novelObj = novels.find(n => n.id === id);
          await setDoc(bookmarkRef, {
            novelId: id,
            userId: user.uid,
            title: novelObj?.title || 'Зохиол',
            coverImage: novelObj?.coverImage || '/images/hero.jpg',
            addedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        handleFirestoreError(
          err,
          isCurrentlySaved ? OperationType.DELETE : OperationType.WRITE,
          `users/${user.uid}/bookmarks/${id}`
        );
      }
    }
  };

  const handleStartReading = (novel: Novel, chapterIdx = 0) => {
    setReadingNovel(novel);
    setCurrentChapterIndex(chapterIdx);
    setSelectedNovel(null);
  };

  const handlePublishNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim() || !newChapterContent.trim()) return;

    setIsPublishing(true);
    const novelId = `novel-${Date.now()}`;
    const authorId = user ? user.uid : 'system';

    const createdNovel: Novel = {
      id: novelId,
      title: newTitle.trim(),
      author: newAuthor.trim(),
      authorId: authorId,
      coverImage: newCover,
      rating: 5.0,
      ratingCount: 1,
      views: '1',
      genre: newGenre,
      ageLimit: '13+',
      status: 'Шинэчлэгдэж буй',
      isNew: true,
      synopsis: newSynopsis.trim() || 'Зохиолын товч танилцуулга оруулаагүй байна.',
      createdAt: new Date().toISOString(),
      chapters: [
        {
          id: 1,
          number: 1,
          title: newChapterTitle.trim() || 'Бүлэг 1: Эхлэл',
          readTime: `${Math.max(3, Math.ceil(newChapterContent.split(' ').length / 150))} мин`,
          publishedDate: 'Өнөөдөр',
          content: newChapterContent.trim()
        }
      ]
    };

    try {
      await setDoc(doc(db, 'novels', novelId), createdNovel);
      setNovels(prev => [createdNovel, ...prev.filter(n => n.id !== novelId)]);
      setIsPublishModalOpen(false);
      setPublishSuccessToast(true);

      // Reset form
      setNewTitle('');
      setNewAuthor('');
      setNewSynopsis('');
      setNewChapterTitle('');
      setNewChapterContent('');

      setTimeout(() => {
        setPublishSuccessToast(false);
      }, 4500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `novels/${novelId}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSubscribe = async (planName: string) => {
    setSubscribedPlan(planName);
    setSubscriptionModal(null);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          vipPlan: planName
        }, { merge: true });
      } catch (err) {
        console.error('Failed to save VIP plan to user profile:', err);
      }
    }
  };

  const handleSignIn = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error('Sign-in failed:', err);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.error('Sign-out failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e5e7eb] flex flex-col font-sans selection:bg-red-600 selection:text-white">
      {/* Toast Notification */}
      <AnimatePresence>
        {publishSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-6 right-6 z-50 bg-[#16181f] border border-emerald-500/50 shadow-2xl rounded-xl px-5 py-4 flex items-center gap-3 text-white"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm text-emerald-400">Шинэ зохиол амжилттай нийтлэгдлээ!</p>
              <p className="text-xs text-neutral-400">Таны бүтээл NOVELFLIX дээр шууд уншигчдад хүрч эхэллээ.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP BAR CONTRACT: Exactly 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 bg-[#0b0c10]/90 backdrop-blur-md border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Single element brand wordmark */}
          <button
            onClick={() => { setActiveTab('home'); setSelectedNovel(null); }}
            className="text-2xl sm:text-3xl font-black tracking-tighter text-red-600 uppercase whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            NOVELFLIX
          </button>

          {/* Zone 2: 4-5 clean single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-300">
            <button
              onClick={() => setActiveTab('home')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${activeTab === 'home' ? 'text-white font-semibold border-b-2 border-red-600' : 'hover:text-white'}`}
            >
              Нүүр
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${activeTab === 'all' ? 'text-white font-semibold border-b-2 border-red-600' : 'hover:text-white'}`}
            >
              Бүх Зохиолууд
            </button>
            <button
              onClick={() => setActiveTab('top10')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${activeTab === 'top10' ? 'text-white font-semibold border-b-2 border-red-600' : 'hover:text-white'}`}
            >
              Шилдэг 10
            </button>
            <button
              onClick={() => setActiveTab('mylist')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 flex items-center gap-1.5 ${activeTab === 'mylist' ? 'text-white font-semibold border-b-2 border-red-600' : 'hover:text-white'}`}
            >
              Миний жагсаалт
              {myList.length > 0 && (
                <span className="text-xs bg-red-600/30 text-red-400 px-1.5 py-0.2 rounded font-mono">
                  {myList.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${activeTab === 'plans' ? 'text-white font-semibold border-b-2 border-red-600' : 'hover:text-white'}`}
            >
              VIP Гишүүнчлэл
            </button>
          </nav>

          {/* Zone 3: 1 primary action cluster */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Firebase Connection Status Indicator */}
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] text-neutral-400 font-mono"
              title={isFirebaseConnected ? 'Firebase Firestore холбогдсон' : 'Firebase холбогдож байна'}
            >
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <Cloud className="w-3 h-3 text-neutral-400" />
              <span>{isFirebaseConnected ? 'Cloud Sync' : 'Холбогдож байна'}</span>
            </div>

            {/* Search toggler / input */}
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Зохиол, зохиолч хайх..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 lg:w-56 bg-white/5 border border-white/10 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 transition-all pl-8"
              />
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Firebase Auth Account Controls */}
            {authLoading ? (
              <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                {user.photoURL ? (
                  <Image
                    src={user.photoURL}
                    alt={user.displayName || 'Хэрэглэгч'}
                    width={24}
                    height={24}
                    className="w-6 h-6 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white text-[11px] flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-neutral-200 hidden lg:inline max-w-[90px] truncate font-medium">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  className="p-1 text-neutral-400 hover:text-red-400 rounded transition-colors"
                  title="Гарах"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-all active:scale-95 whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5 text-red-500" />
                <span>Нэвтрэх</span>
              </button>
            )}

            {/* Primary Action Button: "Зохиол нийтлэх" */}
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-95 rounded-lg transition-all shadow-lg shadow-red-900/30 whitespace-nowrap shrink-0"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Зохиол нийтлэх</span>
              <span className="sm:hidden">Нийтлэх</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around px-4 py-2 border-t border-white/5 text-xs text-neutral-400">
          <button
            onClick={() => setActiveTab('home')}
            className={`py-1 ${activeTab === 'home' ? 'text-red-500 font-semibold' : ''}`}
          >
            Нүүр
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`py-1 ${activeTab === 'all' ? 'text-red-500 font-semibold' : ''}`}
          >
            Зохиолууд
          </button>
          <button
            onClick={() => setActiveTab('top10')}
            className={`py-1 ${activeTab === 'top10' ? 'text-red-500 font-semibold' : ''}`}
          >
            Топ 10
          </button>
          <button
            onClick={() => setActiveTab('mylist')}
            className={`py-1 ${activeTab === 'mylist' ? 'text-red-500 font-semibold' : ''}`}
          >
            Жагсаалт ({myList.length})
          </button>
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-1 ${activeTab === 'plans' ? 'text-red-500 font-semibold' : ''}`}
          >
            VIP
          </button>
          {user ? (
            <button
              onClick={handleSignOut}
              className="py-1 text-neutral-400 hover:text-red-400 flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="py-1 text-red-400 font-semibold flex items-center gap-1"
            >
              <LogIn className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-20">
        {activeTab === 'home' && (
          <>
            {/* HERO SECTION: Netflix Masterpiece Spotlight */}
            <section className="relative w-full h-[70vh] min-h-[500px] max-h-[680px] overflow-hidden flex items-end">
              {/* Background Backdrop with Gradient Scrim */}
              <div className="absolute inset-0 z-0">
                <Image
                  src="/images/hero.jpg"
                  alt="Мөнхийн Титмийн Домог"
                  fill
                  priority
                  className="object-cover object-top opacity-55 scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                {/* Netflix-style vignette and fade scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/60 to-transparent" />
              </div>

              {/* Hero Text Content */}
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 w-full">
                <div className="max-w-2xl space-y-4">
                  {/* Clean unboxed metadata with dot separators (Zero-Pill Discipline) */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-neutral-300">
                    <span className="text-red-500 font-bold uppercase tracking-wider">#1 ТРЕНД ЗОХИОЛ</span>
                    <span aria-hidden="true" className="text-neutral-500">·</span>
                    <span>16+ насны ангилал</span>
                    <span aria-hidden="true" className="text-neutral-500">·</span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      4.9
                    </span>
                    <span aria-hidden="true" className="text-neutral-500">·</span>
                    <span>142 Бүлэг</span>
                    <span aria-hidden="true" className="text-neutral-500">·</span>
                    <span>Б. Тэмүүлэн</span>
                  </div>

                  {/* Headline */}
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none text-balance">
                    Мөнхийн Титмийн Домог
                  </h1>

                  {/* Synopsis */}
                  <p className="text-sm sm:text-base text-neutral-300 line-clamp-3 leading-relaxed max-w-xl">
                    Эртний хаант улсуудын мөхлийн дараа харанхуйн хүч сэрж, дэлхийн хувь тавиланг шийдэх мөнхийн титэм алга болно. Олон зуун мянган залуусыг байлдан дагуулж буй энэ оны хамгийн өндөр хүлээлттэй цуврал новел.
                  </p>

                  {/* Call to Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => handleStartReading(novels[0])}
                      className="flex items-center gap-2.5 px-6 py-3 bg-white text-black font-bold text-sm rounded-lg hover:bg-neutral-200 active:scale-95 transition-all shadow-xl"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Уншиж эхлэх</span>
                    </button>
                    <button
                      onClick={() => setSelectedNovel(novels[0])}
                      className="flex items-center gap-2 px-5 py-3 bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-semibold text-sm rounded-lg transition-all border border-white/10"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Дэлгэрэнгүй</span>
                    </button>
                    <button
                      onClick={() => toggleMyList(novels[0].id)}
                      className="p-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all border border-white/10"
                      title="Жагсаалтад нэмэх"
                    >
                      {myList.includes(novels[0].id) ? (
                        <Check className="w-5 h-5 text-red-500" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Platform Quick Highlights Strip */}
            <div className="border-y border-white/5 bg-[#121318]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <BookOpen className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase">1,200+ Бүлэг</p>
                      <p className="text-[11px] text-neutral-400">Шинэ зохиолууд өдөр бүр</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <Flame className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Шууд нийтлэх</p>
                      <p className="text-[11px] text-neutral-400">Зохиолчдод 100% нээлттэй</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Тав тухтай уншигч</p>
                      <p className="text-[11px] text-neutral-400">Шөнө, өдөр, сепиа горим</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 justify-center sm:justify-start">
                    <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white uppercase">Үнэгүй эхлэл</p>
                      <p className="text-[11px] text-neutral-400">Бүх новелын 1-3-р бүлэг чөлөөтэй</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NETFLIX-STYLE CAROUSEL ROWS */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
              {/* Row 1: Top 10 Trending in Mongolia */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span className="text-red-600">ТОП 10</span> Энэ Долоо Хоногийн Зохиолууд
                  </h2>
                  <button
                    onClick={() => setActiveTab('top10')}
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    Бүгдийг үзэх <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
                  {trendingNovels.slice(0, 6).map((novel, index) => (
                    <div
                      key={novel.id}
                      onClick={() => setSelectedNovel(novel)}
                      className="group relative flex items-center shrink-0 w-64 sm:w-72 bg-[#14161e] rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-red-600/50 transition-all hover:scale-[1.02] shadow-lg"
                    >
                      {/* Huge Netflix-style number ranking */}
                      <span className="text-7xl sm:text-8xl font-black text-white/10 group-hover:text-red-600/30 font-mono pl-3 shrink-0 select-none transition-colors">
                        {index + 1}
                      </span>
                      {/* Card Content */}
                      <div className="relative w-28 sm:w-32 h-40 shrink-0">
                        <Image
                          src={novel.coverImage}
                          alt={novel.title}
                          fill
                          className="object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="p-3 flex flex-col justify-between h-40 flex-1">
                        <div>
                          <div className="text-[11px] text-red-500 font-semibold">{novel.genre}</div>
                          <h3 className="font-bold text-sm text-white line-clamp-2 group-hover:text-red-400 transition-colors">
                            {novel.title}
                          </h3>
                          <p className="text-xs text-neutral-400 mt-1">{novel.author}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span className="flex items-center gap-1 text-amber-400 font-mono">
                            <Star className="w-3 h-3 fill-current" />
                            {novel.rating}
                          </span>
                          <span>{novel.chapters.length} бүлэг</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Row 2: Fantasy & Adventure */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    ⚔️ Фантази & Уран Зөгнөлт Ертөнц
                  </h2>
                  <span className="text-xs text-neutral-500">Сонгодог баатарлаг туульсууд</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {fantasyNovels.map((novel) => (
                    <NovelCard
                      key={novel.id}
                      novel={novel}
                      isBookmarked={myList.includes(novel.id)}
                      onSelect={() => setSelectedNovel(novel)}
                      onRead={() => handleStartReading(novel)}
                      onToggleBookmark={(e) => toggleMyList(novel.id, e)}
                    />
                  ))}
                </div>
              </section>

              {/* Row 3: Romance & Drama */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    ❤️ Хайр Дурлал & Драм
                  </h2>
                  <span className="text-xs text-neutral-500">Сэтгэл хөдөлгөм намуун өгүүллэгүүд</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {romanceNovels.map((novel) => (
                    <NovelCard
                      key={novel.id}
                      novel={novel}
                      isBookmarked={myList.includes(novel.id)}
                      onSelect={() => setSelectedNovel(novel)}
                      onRead={() => handleStartReading(novel)}
                      onToggleBookmark={(e) => toggleMyList(novel.id, e)}
                    />
                  ))}
                </div>
              </section>

              {/* Row 4: Mystery, Noir & Sci-Fi */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    🕵️ Адал Явдал, Нууцлаг Тайлал & Ирээдүй
                  </h2>
                  <span className="text-xs text-neutral-500">Сэтгэл түгшээм ээдрээтэй мөрдлөгүүд</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {mysteryNovels.map((novel) => (
                    <NovelCard
                      key={novel.id}
                      novel={novel}
                      isBookmarked={myList.includes(novel.id)}
                      onSelect={() => setSelectedNovel(novel)}
                      onRead={() => handleStartReading(novel)}
                      onToggleBookmark={(e) => toggleMyList(novel.id, e)}
                    />
                  ))}
                </div>
              </section>
            </div>

            {/* AUTHOR CALLOUT: Why Write on NOVELFLIX */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
              <div className="relative rounded-2xl bg-gradient-to-r from-red-950/40 via-[#161820] to-[#12131a] border border-red-900/30 p-8 sm:p-12 overflow-hidden">
                <div className="relative z-10 max-w-2xl space-y-4">
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    ЗОХИОЛЧИД БОЛОН УРАН БҮТЭЭЛЧДЭД
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Та өөрийн зохиолоо нийтэлж, мянга мянган үнэнч уншигчидтай болоорой
                  </h2>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    NOVELFLIX нь Монголын зохиолчдод зориулсан бүрэн хэмжээний бичих болон нийтлэх платформоор хангаж байна. Бүлэг бүрээ удирдах, уншигчдын сэтгэгдэл, үнэлгээг цаг алдалгүй хүлээн авах, бүтээлээ хамгаалах боломжийг бид танд олгоно.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      onClick={() => setIsPublishModalOpen(true)}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-lg transition-all shadow-lg active:scale-95 flex items-center gap-2"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Өнөөдөр анхны зохиолоо нийтлэх</span>
                    </button>
                    <div className="text-xs text-neutral-400">
                      * Бүртгэл шаардлагагүй, шууд ноороглоод нийтлэх боломжтой
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SUBSCRIPTION / VIP MEMBERSHIP TIERS */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
              <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
                <span className="text-xs font-bold text-red-500 uppercase tracking-widest">
                  УНШИГЧИЙН СОНГОЛТ
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Өөрт тохирох VIP багцаа сонгоорой
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400">
                  Хүссэн үедээ цуцлах боломжтой. Бүх төхөөрөмж дээр ажиллана.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Free Tier */}
                <div className="bg-[#14161e] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-neutral-300">Үнэгүй Уншигч</div>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-3xl font-extrabold text-white">0₮</span>
                      <span className="text-xs text-neutral-400">/ сар</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Шинээр орж буй уншигчдад зориулсан суурь эрх
                    </p>
                    <ul className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Бүх зохиолын 1-3 бүлэг үнэгүй</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Сард 5 шинэ бүлэг унших</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Сэтгэгдэл бичих & үнэлгээ өгөх</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => setActiveTab('all')}
                    className="mt-8 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    Үнэгүй уншиж эхлэх
                  </button>
                </div>

                {/* VIP Reader Tier (Featured) */}
                <div className="bg-gradient-to-b from-[#1c1822] to-[#12131a] border-2 border-red-600 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl shadow-red-900/20">
                  <div className="absolute -top-3 left-1/2 -translate-y-0 -translate-x-1/2 bg-red-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
                    ХАМГИЙН ИХ СОНГОГДСОН
                  </div>
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-red-400 flex items-center justify-between">
                      <span>VIP Уншигч</span>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-3xl font-extrabold text-white">14,900₮</span>
                      <span className="text-xs text-neutral-400">/ сар</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Хязгааргүй унших, шинэ бүлгүүдийг бусдаас түрүүлж үзэх
                    </p>
                    <ul className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Бүх зохиолын бүх бүлгийг ХЯЗГААРГҮЙ унших</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Шинэ бүлгүүд 48 цагийн түрүүлж нээгдэнэ</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Зар сурталчилгаагүй цэвэр унших орчин</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Офлайн горимд татаж авах эрх</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleSubscribe('VIP Уншигч')}
                    className="mt-8 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs transition-colors shadow-lg shadow-red-900/30"
                  >
                    {subscribedPlan === 'VIP Уншигч' ? 'Идэвхжсэн байна' : 'VIP Эрх идэвхжүүлэх'}
                  </button>
                </div>

                {/* Author Pro Tier */}
                <div className="bg-[#14161e] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-neutral-300">Зохиолч Про</div>
                    <div className="flex items-baseline gap-1 font-mono">
                      <span className="text-3xl font-extrabold text-white">29,900₮</span>
                      <span className="text-xs text-neutral-400">/ сар</span>
                    </div>
                    <p className="text-xs text-neutral-400">
                      Өөрийн новелыг бүрэн хэмжээгээр борлуулж орлого олох
                    </p>
                    <ul className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Зохиолын бүлгүүдийг төлбөртэй болгох эрх</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Борлуулалтын орлогын 85%-ийг дансандаа авах</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Дэлгэрэнгүй уншигчдын аналитик график</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Нүүр хуудсан дээр промо байршил авах</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleSubscribe('Зохиолч Про')}
                    className="mt-8 w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold text-xs transition-colors"
                  >
                    {subscribedPlan === 'Зохиолч Про' ? 'Идэвхжсэн байна' : 'Зохиолч болох'}
                  </button>
                </div>
              </div>
            </section>

            {/* FREQUENTLY ASKED QUESTIONS (Netflix Style FAQ Accordion) */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight text-center mb-8">
                Түгээмэл Асуултууд
              </h2>
              <div className="space-y-3">
                <FaqItem
                  question="NOVELFLIX платформ гэж юу вэ?"
                  answer="NOVELFLIX бол Монголын зохиолчдын уран зөгнөлт, романс, лайт новел, адал явдалт бүтээлүүдийг Netflix шиг тав тухтай орчинд унших, мөн шинэ залуу зохиолчид өөрсдийн зохиолоо шууд нийтлэн уншигчдад хүргэх орчин үеийн платформ юм."
                />
                <FaqItem
                  question="Би хэрхэн өөрийн зохиолоо нийтлэх вэ?"
                  answer="Дээд хэсэгт байрлах 'Зохиол нийтлэх' товч дээр дарж зохиолынхоо нэр, төрөл, хавтас болон анхны бүлгээ бичээд л шууд нийтлэх боломжтой. Та хүссэн үедээ дараа дараагийн шинэ бүлгүүдийг нэмж болно."
                />
                <FaqItem
                  question="Үнэгүй уншиж болох уу?"
                  answer="Тийм ээ! Платформ дээрх бүх зохиолуудын эхний 1-3 бүлэг үнэ төлбөргүй нээлттэй байдаг бөгөөд та ямар ч төлбөргүйгээр уншиж танилцаж болно."
                />
                <FaqItem
                  question="Зохиолчид өөрсдийн бүтээлээс орлого олох боломжтой юу?"
                  answer="Тийм. Зохиолч Про багцыг сонгосноор та өөрийн зохиолын бүлгүүдэд үнэ тогтоож, уншигчдын худалдан авалтаас орлогын 85 хүртэлх хувийг сар бүр дансандаа хүлээн авах боломжтой."
                />
              </div>
            </section>

            {/* NEWSLETTER / CONVERSION CALL TO ACTION */}
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 text-center">
              <div className="bg-[#12131a] border border-white/5 rounded-2xl p-8 sm:p-12 space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Шинэ бүлэг болон шилдэг зохиолуудыг цаг алдалгүй хүлээн авах
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
                  И-мэйл хаягаа үлдээгээд долоо хоног бүрийн шилдэг шинэ зохиолуудын тухай мэдээлэл болон 7 хоногийн VIP эрх үнэгүй аваарай.
                </p>

                {newsletterSuccess ? (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold">
                    Баярлалаа! Таны 7 хоногийн VIP эрхийн код имэйл хаягаар илгээгдлээ.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (newsletterEmail.includes('@')) {
                        setNewsletterSuccess(true);
                      }
                    }}
                    className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2"
                  >
                    <input
                      type="email"
                      required
                      placeholder="Таны и-мэйл хаяг..."
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors whitespace-nowrap"
                    >
                      Бүртгүүлэх
                    </button>
                  </form>
                )}
              </div>
            </section>
          </>
        )}

        {/* BROWSE ALL NOVELS VIEW */}
        {activeTab === 'all' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Бүх Зохиолууд
                </h1>
                <p className="text-xs text-neutral-400 mt-1">
                  Нийт {filteredNovels.length} бүтээл олдлоо
                </p>
              </div>

              {/* Genre Selector Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg">
                {['Бүгд', 'Фантази', 'Адал явдалт', 'Хайр дурлал', 'Нууцлаг', 'Шинжлэх ухаан'].map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                      selectedGenre === genre
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {filteredNovels.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-neutral-300">Тохирох зохиол олдсонгүй</p>
                <p className="text-xs text-neutral-500 mt-1">Та хайлтын үгээ өөрчлөх эсвэл шинэ зохиол нийтлээрэй.</p>
                <button
                  onClick={() => setIsPublishModalOpen(true)}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                >
                  Шинэ зохиол нийтлэх
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredNovels.map((novel) => (
                  <NovelCard
                    key={novel.id}
                    novel={novel}
                    isBookmarked={myList.includes(novel.id)}
                    onSelect={() => setSelectedNovel(novel)}
                    onRead={() => handleStartReading(novel)}
                    onToggleBookmark={(e) => toggleMyList(novel.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TOP 10 RANKING VIEW */}
        {activeTab === 'top10' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div className="border-b border-white/5 pb-4">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">ШАЛГАРСАН БҮТЭЭЛҮҮД</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
                Монголын Топ 10 Зохиол
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Уншигчдын үнэлгээ, уншилтын тоо болон долоо хоногийн хандалтаар эрэмбэлэгдсэн.
              </p>
            </div>

            <div className="space-y-3">
              {novels.map((novel, idx) => (
                <div
                  key={novel.id}
                  onClick={() => setSelectedNovel(novel)}
                  className="group flex items-center justify-between p-4 bg-[#14161e] border border-white/5 hover:border-red-600/40 rounded-xl cursor-pointer transition-all hover:bg-[#181a24]"
                >
                  <div className="flex items-center gap-4 sm:gap-6 min-w-0">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-neutral-500 group-hover:text-red-500 w-8 text-center transition-colors">
                      {idx + 1}
                    </span>
                    <div className="relative w-14 h-20 sm:w-16 sm:h-24 rounded-lg overflow-hidden shrink-0 border border-white/10">
                      <Image
                        src={novel.coverImage}
                        alt={novel.title}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400">
                        <span className="text-red-400 font-semibold">{novel.genre}</span>
                        <span>·</span>
                        <span>{novel.ageLimit}</span>
                        <span>·</span>
                        <span>{novel.status}</span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-red-400 transition-colors truncate">
                        {novel.title}
                      </h3>
                      <p className="text-xs text-neutral-400">{novel.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-amber-400 font-mono text-xs justify-end">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{novel.rating}</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 font-mono">{novel.views} уншигдсан</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartReading(novel);
                      }}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="hidden sm:inline">Унших</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MY LIST VIEW */}
        {activeTab === 'mylist' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Миний Хадгалсан Зохиолууд
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Таны дараа уншихаар тэмдэглэсэн {myListNovels.length} зохиол байна.
              </p>
            </div>

            {myListNovels.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                <Bookmark className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-sm font-semibold text-neutral-300">Жагсаалт хоосон байна</p>
                <p className="text-xs text-neutral-500 mt-1">Дуртай зохиолынхоо хажууд байх &apos;+&apos; товчийг дарж хадгалаарай.</p>
                <button
                  onClick={() => setActiveTab('all')}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
                >
                  Зохиол хайх
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {myListNovels.map((novel) => (
                  <NovelCard
                    key={novel.id}
                    novel={novel}
                    isBookmarked={true}
                    onSelect={() => setSelectedNovel(novel)}
                    onRead={() => handleStartReading(novel)}
                    onToggleBookmark={(e) => toggleMyList(novel.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIP MEMBERSHIP VIEW */}
        {activeTab === 'plans' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold text-red-500 uppercase tracking-widest">NOVELFLIX PREMIUM</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Хязгааргүй Зохиолын Ертөнцөд Тавтай Морил
              </h1>
              <p className="text-sm text-neutral-400">
                Та дуртай зохиолчдынхоо бүтээлийг цаг алдалгүй дэмжиж, тав тухтай уншаарай.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* Free Tier */}
              <div className="bg-[#14161e] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-neutral-300">Үнэгүй Уншигч</div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-white">0₮</span>
                    <span className="text-xs text-neutral-400">/ сар</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Бүх зохиолын эхний 3 бүлэг</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Утас, таблет, комьпютерээс унших</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => setActiveTab('home')}
                  className="mt-8 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-semibold text-xs"
                >
                  Нүүр хуудас руу буцах
                </button>
              </div>

              {/* VIP Tier */}
              <div className="bg-gradient-to-b from-[#1e1925] to-[#12131a] border-2 border-red-600 rounded-2xl p-6 flex flex-col justify-between relative shadow-2xl">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-red-400 flex items-center justify-between">
                    <span>VIP Уншигч</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-white">14,900₮</span>
                    <span className="text-xs text-neutral-400">/ сар</span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    Монголын хамгийн том цуврал зохиолын сан бүрэн нээгдэнэ
                  </p>
                  <ul className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Бүх зохиолын БҮХ бүлэг 100% нээлттэй</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Шинэ бүлгүүд 48 цагийн өмнө нээгдэнэ</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Зар сурталчилгаагүй</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-red-500 shrink-0" />
                      <span>Офлайн унших эрх</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSubscribe('VIP Уншигч')}
                  className="mt-8 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-xs shadow-lg shadow-red-900/30"
                >
                  {subscribedPlan === 'VIP Уншигч' ? 'Идэвхжсэн байна' : 'Одоо идэвхжүүлэх (14,900₮)'}
                </button>
              </div>

              {/* Author Pro */}
              <div className="bg-[#14161e] border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="text-sm font-semibold text-neutral-300">Зохиолч Про</div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-3xl font-extrabold text-white">29,900₮</span>
                    <span className="text-xs text-neutral-400">/ сар</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Зохиолоо борлуулах & орлого олох</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Уншигчдын нарийвчилсан статистик</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Онцлох бүтээлийн баннер дээр гарах</span>
                    </li>
                  </ul>
                </div>
                <button
                  onClick={() => handleSubscribe('Зохиолч Про')}
                  className="mt-8 w-full py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg font-semibold text-xs"
                >
                  {subscribedPlan === 'Зохиолч Про' ? 'Идэвхжсэн байна' : 'Зохиолч Про сонгох'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* NOVEL DETAIL MODAL (Netflix Episode & Detail Style) */}
      <AnimatePresence>
        {selectedNovel && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-[#14161e] rounded-2xl overflow-hidden border border-white/10 shadow-2xl my-8 text-neutral-200"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedNovel(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Hero Banner */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <Image
                  src={selectedNovel.coverImage}
                  alt={selectedNovel.title}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14161e] via-[#14161e]/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-end justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-300">
                      <span className="text-red-500 font-bold">{selectedNovel.genre}</span>
                      <span>·</span>
                      <span>{selectedNovel.ageLimit}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-amber-400 font-mono">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {selectedNovel.rating} ({selectedNovel.ratingCount.toLocaleString()} үнэлгээ)
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                      {selectedNovel.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-neutral-400">Зохиолч: {selectedNovel.author}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleStartReading(selectedNovel, 0)}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-red-900/30"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Уншиж эхлэх</span>
                    </button>
                    <button
                      onClick={() => toggleMyList(selectedNovel.id)}
                      className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                      title="Жагсаалтад нэмэх"
                    >
                      {myList.includes(selectedNovel.id) ? (
                        <Check className="w-4 h-4 text-red-500" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">
                {/* Synopsis */}
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                    Зохиолын Товч Агуулга
                  </h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {selectedNovel.synopsis}
                  </p>
                </div>

                {/* Chapter List (Netflix episode-style) */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                      Бүлгүүд ({selectedNovel.chapters.length})
                    </h4>
                    <span className="text-xs text-neutral-500 font-mono">
                      Статус: {selectedNovel.status}
                    </span>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                    {selectedNovel.chapters.map((chap, idx) => (
                      <div
                        key={chap.id}
                        onClick={() => handleStartReading(selectedNovel, idx)}
                        className="group flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 rounded-xl cursor-pointer transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-neutral-500 w-6">
                            {idx + 1}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-white group-hover:text-red-400 transition-colors">
                              {chap.title}
                            </div>
                            <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span>Унших хугацаа: {chap.readTime}</span>
                              <span>·</span>
                              <span>Нийтлэгдсэн: {chap.publishedDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                            Нээлттэй
                          </span>
                          <Play className="w-4 h-4 text-neutral-400 group-hover:text-red-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN IMMERSIVE NOVEL READER */}
      <AnimatePresence>
        {readingNovel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 overflow-y-auto ${
              readerTheme === 'dark'
                ? 'bg-[#0f1016] text-[#e0e2ec]'
                : readerTheme === 'sepia'
                ? 'bg-[#f4ecd8] text-[#3c2f1f]'
                : 'bg-black text-[#d0d0d0]'
            }`}
          >
            {/* Reader Top Toolbar */}
            <div
              className={`sticky top-0 z-20 px-4 sm:px-8 py-3 flex items-center justify-between border-b ${
                readerTheme === 'sepia'
                  ? 'bg-[#f4ecd8]/90 border-[#3c2f1f]/10'
                  : 'bg-[#0f1016]/90 border-white/10'
              } backdrop-blur-md`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setReadingNovel(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    readerTheme === 'sepia'
                      ? 'hover:bg-[#3c2f1f]/10 text-[#3c2f1f]'
                      : 'hover:bg-white/10 text-white'
                  }`}
                  title="Гарах"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h3 className="text-xs sm:text-sm font-bold truncate">
                    {readingNovel.title}
                  </h3>
                  <p className="text-[11px] opacity-70 truncate">
                    {readingNovel.chapters[currentChapterIndex]?.title}
                  </p>
                </div>
              </div>

              {/* Reader Settings (Font Size, Theme) */}
              <div className="flex items-center gap-2">
                {/* Theme Selector */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-black/10 dark:bg-white/5">
                  <button
                    onClick={() => setReaderTheme('dark')}
                    className={`p-1.5 rounded text-xs ${readerTheme === 'dark' ? 'bg-red-600 text-white' : 'opacity-60'}`}
                    title="Харанхуй горим"
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setReaderTheme('sepia')}
                    className={`p-1.5 rounded text-xs ${readerTheme === 'sepia' ? 'bg-amber-700 text-white' : 'opacity-60'}`}
                    title="Сепиа горим"
                  >
                    <Coffee className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setReaderTheme('black')}
                    className={`p-1.5 rounded text-xs ${readerTheme === 'black' ? 'bg-neutral-800 text-white' : 'opacity-60'}`}
                    title="Үнэмлэхүй хар"
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Font Size Toggle */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-black/10 dark:bg-white/5 text-xs font-mono">
                  <button
                    onClick={() => setReaderFontSize('small')}
                    className={`px-2 py-1 rounded ${readerFontSize === 'small' ? 'bg-red-600 text-white' : 'opacity-60'}`}
                  >
                    A-
                  </button>
                  <button
                    onClick={() => setReaderFontSize('medium')}
                    className={`px-2 py-1 rounded ${readerFontSize === 'medium' ? 'bg-red-600 text-white' : 'opacity-60'}`}
                  >
                    A
                  </button>
                  <button
                    onClick={() => setReaderFontSize('large')}
                    className={`px-2 py-1 rounded ${readerFontSize === 'large' ? 'bg-red-600 text-white' : 'opacity-60'}`}
                  >
                    A+
                  </button>
                </div>

                <button
                  onClick={() => setReadingNovel(null)}
                  className={`p-2 rounded-lg transition-colors ${
                    readerTheme === 'sepia'
                      ? 'hover:bg-[#3c2f1f]/10 text-[#3c2f1f]'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Reading Content Canvas */}
            <div className="max-w-2xl mx-auto px-6 sm:px-8 py-12">
              <div className="text-center pb-8 border-b border-current/10 mb-8 space-y-2">
                <span className="text-xs uppercase font-bold tracking-widest opacity-60">
                  {readingNovel.genre} · Зохиолч: {readingNovel.author}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {readingNovel.chapters[currentChapterIndex]?.title}
                </h1>
                <p className="text-xs opacity-60">
                  Унших хугацаа: {readingNovel.chapters[currentChapterIndex]?.readTime} · Нийтлэгдсэн: {readingNovel.chapters[currentChapterIndex]?.publishedDate}
                </p>
              </div>

              {/* Chapter Prose Text */}
              <div
                className={`prose prose-invert max-w-none leading-relaxed whitespace-pre-line font-serif ${
                  readerFontSize === 'small'
                    ? 'text-sm sm:text-base'
                    : readerFontSize === 'medium'
                    ? 'text-base sm:text-lg'
                    : 'text-lg sm:text-xl'
                }`}
                style={{
                  color: readerTheme === 'sepia' ? '#3c2f1f' : undefined,
                  lineHeight: '1.9'
                }}
              >
                {readingNovel.chapters[currentChapterIndex]?.content}
              </div>

              {/* Chapter Bottom Navigation Controls */}
              <div className="mt-14 pt-8 border-t border-current/10 flex items-center justify-between">
                <button
                  disabled={currentChapterIndex === 0}
                  onClick={() => setCurrentChapterIndex(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" /> Өмнөх бүлэг
                </button>

                <span className="text-xs opacity-60 font-mono">
                  {currentChapterIndex + 1} / {readingNovel.chapters.length} Бүлэг
                </span>

                <button
                  disabled={currentChapterIndex >= readingNovel.chapters.length - 1}
                  onClick={() => setCurrentChapterIndex(prev => Math.min(readingNovel.chapters.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  Дараагийн бүлэг <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AUTHOR PUBLISHING STUDIO MODAL (Зохиол нийтлэх систем) */}
      <AnimatePresence>
        {isPublishModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-[#14161f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl my-8 text-neutral-200"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-[#191b26] border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Шинэ Зохиол Нийтлэх</h3>
                    <p className="text-xs text-neutral-400">Өөрийн бүтээлээ NOVELFLIX уншигчдад хүргээрэй</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  className="text-neutral-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePublishNovel} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Зохиолын нэр *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Жишээ: Цасан Доорх Зүрх"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Зохиолчийн нэр / Псевдоним *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Жишээ: Б. Золбоо"
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Төрөл / Ангилал
                    </label>
                    <select
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value as any)}
                      className="w-full bg-[#1c1e2a] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Фантази">Фантази (Fantasy)</option>
                      <option value="Адал явдалт">Адал явдалт (Adventure)</option>
                      <option value="Хайр дурлал">Хайр дурлал (Romance)</option>
                      <option value="Нууцлаг">Нууцлаг & Триллер (Mystery)</option>
                      <option value="Шинжлэх ухаан">Шинжлэх ухаан (Sci-Fi)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Хавтасны хэв маяг
                    </label>
                    <div className="flex gap-2">
                      {[
                        { label: 'Фантази', path: '/images/fantasy.jpg' },
                        { label: 'Нуар', path: '/images/noir.jpg' },
                        { label: 'Романс', path: '/images/romance.jpg' },
                        { label: 'Баатарлаг', path: '/images/hero.jpg' }
                      ].map((c) => (
                        <button
                          type="button"
                          key={c.path}
                          onClick={() => setNewCover(c.path)}
                          className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg border transition-all ${
                            newCover === c.path
                              ? 'border-red-500 bg-red-600/20 text-white font-bold'
                              : 'border-white/10 bg-white/5 text-neutral-400'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1">
                    Зохиолын товч танилцуулга (Synopsis)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Зохиолын үйл явдал, гол баатрын тухай товч мэдээлэл..."
                    value={newSynopsis}
                    onChange={(e) => setNewSynopsis(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                  />
                </div>

                {/* Chapter 1 Details */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <div className="text-xs font-bold text-red-500 uppercase tracking-wider">
                    Анхны бүлэг оруулах
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1">
                      Бүлгийн гарчиг *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Жишээ: Бүлэг 1: Үүрийн манан дунд"
                      value={newChapterTitle}
                      onChange={(e) => setNewChapterTitle(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1 flex items-center justify-between">
                      <span>Бүлгийн эх бичвэр *</span>
                      <span className="text-[11px] font-mono text-neutral-500">
                        {newChapterContent.split(' ').filter(Boolean).length} үг
                      </span>
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Энд зохиолынхоо эхний бүлгийн агуулгыг бичнэ үү..."
                      value={newChapterContent}
                      onChange={(e) => setNewChapterContent(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-red-500 font-serif leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/5">
                  <button
                    type="button"
                    disabled={isPublishing}
                    onClick={() => setIsPublishModalOpen(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-neutral-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Болих
                  </button>
                  <button
                    type="submit"
                    disabled={isPublishing}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg shadow-red-900/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>{isPublishing ? 'Нийтэлж байна...' : 'Шууд Нийтлэх'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#0a0a0e] text-neutral-500 text-xs py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-red-600">NOVELFLIX</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400">Монголын Анхны Цуврал Зохиолын Платформ</span>
            </div>

            <div className="flex items-center gap-6">
              <button onClick={() => setActiveTab('home')} className="hover:text-white transition-colors">Нүүр</button>
              <button onClick={() => setActiveTab('all')} className="hover:text-white transition-colors">Зохиолууд</button>
              <button onClick={() => setActiveTab('plans')} className="hover:text-white transition-colors">VIP Гишүүнчлэл</button>
              <button onClick={() => setIsPublishModalOpen(true)} className="hover:text-white transition-colors">Зохиол Нийтлэх</button>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <p>© 2026 NOVELFLIX Mongolia. Бүх эрх хуулиар хамгаалагдсан. Зохиогчийн эрхийн хуулийг чанд мөрдөнө.</p>
            <div className="flex items-center gap-4">
              <span>Холбоо барих: contact@novelflix.mn</span>
              <span>Улаанбаатар хот</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable Novel Card Component (3:4 Poster Ratio with Netflix-style hover actions)
function NovelCard({
  novel,
  isBookmarked,
  onSelect,
  onRead,
  onToggleBookmark
}: {
  novel: Novel;
  isBookmarked: boolean;
  onSelect: () => void;
  onRead: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onSelect}
      className="group relative bg-[#13151c] rounded-xl overflow-hidden border border-white/5 hover:border-red-600/40 cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-red-950/20 flex flex-col"
    >
      {/* 3:4 Book Cover Image Slot */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
        <Image
          src={novel.coverImage}
          alt={novel.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Hover Quick Action Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRead();
            }}
            className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 transition-transform shadow-lg"
            title="Унших"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
          <button
            onClick={onToggleBookmark}
            className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/90 transition-colors border border-white/20"
            title="Хадгалах"
          >
            {isBookmarked ? (
              <Check className="w-4 h-4 text-red-500" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Top badges: New or Rating */}
        {novel.isNew && (
          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow">
            ШИНЭ
          </span>
        )}
      </div>

      {/* Card Details */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <div className="text-[10px] font-semibold text-red-500 uppercase tracking-wider">
            {novel.genre}
          </div>
          <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-red-400 transition-colors">
            {novel.title}
          </h3>
          <p className="text-[11px] text-neutral-400 truncate mt-0.5">{novel.author}</p>
        </div>

        {/* Clean unboxed metadata (No Pill Enclosures) */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1 text-amber-400 font-mono">
            <Star className="w-3 h-3 fill-current" />
            {novel.rating}
          </span>
          <span className="font-mono">{novel.chapters.length} бүлэг</span>
        </div>
      </div>
    </div>
  );
}

// Reusable FAQ Item Component
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 rounded-xl bg-[#14161e] overflow-hidden transition-colors">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-white hover:text-red-400 transition-colors"
      >
        <span>{question}</span>
        <ChevronRight
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-90 text-red-500' : 'text-neutral-500'
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}
