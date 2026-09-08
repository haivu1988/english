export interface CuratedCardItem {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  exampleSentence: string;
  exampleTranslation: string;
  memoryTip: string;
  collocations: string[];
  level: string; // 'A1-A2' | 'B1-B2' | 'C1-C2' | 'IELTS' | 'TOEIC' | 'Business'
  category: string; // 'daily' | 'work' | 'travel' | 'ielts' | 'cafe' | 'tech' | 'idioms' | 'general'
}

export const CURATED_VOCABULARY: CuratedCardItem[] = [
  // A1-A2: Daily & Basic
  {
    word: 'appreciate',
    phonetic: '/əˈpriː.ʃi.eɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Cảm kích, trân trọng, đánh giá cao',
    exampleSentence: 'I really appreciate your help with my English homework.',
    exampleTranslation: 'Tôi rất cảm kích sự giúp đỡ của bạn với bài tập tiếng Anh.',
    memoryTip: 'Nhớ câu cảm ơn lịch sự: "I appreciate it!" thay cho "Thank you" quen thuộc.',
    collocations: ['greatly appreciate', 'appreciate your time', 'hard to appreciate'],
    level: 'A1-A2',
    category: 'daily',
  },
  {
    word: 'convenient',
    phonetic: '/kənˈviː.ni.ənt/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Tiện lợi, thuận tiện',
    exampleSentence: 'Living near a subway station is extremely convenient.',
    exampleTranslation: 'Sống gần ga tàu điện ngầm cực kỳ thuận tiện.',
    memoryTip: 'Cửa hàng tiện lợi tiếng Anh là "Convenience store" - nơi bán mọi thứ thuận tiện.',
    collocations: ['convenient time', 'convenient location', 'fast and convenient'],
    level: 'A1-A2',
    category: 'daily',
  },
  {
    word: 'delicious',
    phonetic: '/dɪˈlɪʃ.əs/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Ngon miệng, thơm ngon',
    exampleSentence: 'This traditional Vietnamese beef pho is absolutely delicious.',
    exampleTranslation: 'Món phở bò truyền thống Việt Nam này thực sự rất ngon.',
    memoryTip: 'Âm "deli" giống tiệm đồ ăn Deli - đồ ăn lúc nào cũng ngon lành.',
    collocations: ['delicious meal', 'taste delicious', 'look delicious'],
    level: 'A1-A2',
    category: 'cafe',
  },
  {
    word: 'recommend',
    phonetic: '/ˌrek.əˈmend/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Gợi ý, giới thiệu, tiến cử',
    exampleSentence: 'Can you recommend a good coffee shop around here?',
    exampleTranslation: 'Bạn có thể gợi ý một quán cà phê ngon quanh đây không?',
    memoryTip: 'Khi ai đó re-comment (bình luận khen lại) nghĩa là họ đang giới thiệu món tốt.',
    collocations: ['highly recommend', 'recommend a dish', 'recommend doing something'],
    level: 'A1-A2',
    category: 'cafe',
  },
  {
    word: 'departure',
    phonetic: '/dɪˈpɑː.tʃər/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Sự khởi hành, giờ xuất phát',
    exampleSentence: 'Passengers should arrive two hours before scheduled departure.',
    exampleTranslation: 'Hành khách nên đến sân bay 2 tiếng trước giờ khởi hành dự kiến.',
    memoryTip: 'Ngược lại với "Arrival" (đến nơi) ở bảng hiệu sân bay là "Departure" (khởi hành).',
    collocations: ['departure gate', 'departure time', 'time of departure'],
    level: 'A1-A2',
    category: 'travel',
  },
  {
    word: 'destination',
    phonetic: '/ˌdes.tɪˈneɪ.ʃən/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Điểm đến, đích đến',
    exampleSentence: 'Da Nang is a popular tourist destination for international travelers.',
    exampleTranslation: 'Đà Nẵng là điểm đến du lịch nổi tiếng đối với du khách quốc tế.',
    memoryTip: 'Liên tưởng "destiny" (định mệnh) đưa ta đến "destination" (đích đến cuộc đời).',
    collocations: ['final destination', 'popular destination', 'holiday destination'],
    level: 'A1-A2',
    category: 'travel',
  },

  // B1-B2: Work & Workplace
  {
    word: 'procrastinate',
    phonetic: '/prəˈkræs.tɪ.neɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Trì hoãn, chần chừ việc cần làm',
    exampleSentence: 'I tend to procrastinate whenever I have a difficult report to write.',
    exampleTranslation: 'Tôi hay trì hoãn mỗi khi có một báo cáo khó cần phải hoàn thành.',
    memoryTip: 'Người "pro" (chuyên nghiệp) trong việc "chần chừ" chính là người hay trì hoãn!',
    collocations: ['stop procrastinating', 'tend to procrastinate', 'chronic procrastinator'],
    level: 'B1-B2',
    category: 'work',
  },
  {
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Kiên cường, bền bỉ, mau hồi phục sau khó khăn',
    exampleSentence: 'Our team remained resilient despite the tight deadlines and budget cuts.',
    exampleTranslation: 'Đội ngũ của chúng tôi vẫn kiên cường bất chấp hạn chót gấp và bị cắt giảm ngân sách.',
    memoryTip: 'Giống như cây tre trước gió bão, uốn cong nhưng không gãy, bật dậy kiên cường.',
    collocations: ['mentally resilient', 'resilient economy', 'resilient workforce'],
    level: 'B1-B2',
    category: 'work',
  },
  {
    word: 'prioritize',
    phonetic: '/praɪˈɒr.ɪ.taɪz/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Ưu tiên, đặt lên hàng đầu',
    exampleSentence: 'You need to prioritize urgent client requests before answering emails.',
    exampleTranslation: 'Bạn cần ưu tiên các yêu cầu khẩn cấp của khách hàng trước khi trả lời email.',
    memoryTip: 'Bắt nguồn từ "prior" (trước tiên) -> chọn việc quan trọng làm trước.',
    collocations: ['prioritize tasks', 'prioritize health', 'need to prioritize'],
    level: 'B1-B2',
    category: 'work',
  },
  {
    word: 'collaborate',
    phonetic: '/kəˈlæb.ə.reɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Hợp tác, cộng tác cùng làm việc',
    exampleSentence: 'Our engineering department will collaborate closely with the design team.',
    exampleTranslation: 'Phòng kỹ thuật sẽ hợp tác chặt chẽ với đội ngũ thiết kế.',
    memoryTip: 'Tiền tố "Co" (cùng nhau) + "Labor" (lao động) = cùng nhau chung sức làm việc.',
    collocations: ['collaborate on a project', 'collaborate with colleagues', 'closely collaborate'],
    level: 'B1-B2',
    category: 'work',
  },
  {
    word: 'spontaneous',
    phonetic: '/spɒnˈteɪ.ni.əs/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Ngẫu hứng, tự phát, không lên kế hoạch trước',
    exampleSentence: 'We made a spontaneous decision to go camping over the weekend.',
    exampleTranslation: 'Chúng tôi đã đưa ra quyết định ngẫu hứng đi cắm trại vào cuối tuần.',
    memoryTip: 'Bộc phát tự nhiên như tiếng cười hay một chuyến đi không hề báo trước.',
    collocations: ['spontaneous decision', 'spontaneous reaction', 'be more spontaneous'],
    level: 'B1-B2',
    category: 'daily',
  },
  {
    word: 'overwhelm',
    phonetic: '/ˌəʊ.vəˈwelm/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Làm cho ngợp, quá tải, choáng ngợp',
    exampleSentence: 'The huge amount of information can easily overwhelm new employees.',
    exampleTranslation: 'Khối lượng thông tin khổng lồ có thể dễ dàng làm nhân viên mới bị quá tải.',
    memoryTip: '"Over" (quá mức) trút xuống như con sóng lớn làm ta bị ngợp ngập.',
    collocations: ['feel overwhelmed', 'overwhelmed with work', 'overwhelmed by emotions'],
    level: 'B1-B2',
    category: 'daily',
  },

  // Idioms & Natural Speech
  {
    word: 'hit the sack',
    phonetic: '/hɪt ðə sæk/',
    partOfSpeech: 'idiom',
    vietnameseMeaning: 'Đi ngủ (khi đã kiệt sức)',
    exampleSentence: "I have an early meeting tomorrow, so I'm going to hit the sack now.",
    exampleTranslation: 'Sáng mai tôi có cuộc họp sớm nên tôi sẽ đi ngủ ngay bây giờ.',
    memoryTip: 'Xưa người lính dùng bao tải rơm (sack) làm gối, ngả lưng xuống gối là ngủ.',
    collocations: ['time to hit the sack', 'ready to hit the sack'],
    level: 'B1-B2',
    category: 'idioms',
  },
  {
    word: 'cut corners',
    phonetic: '/kʌt ˈkɔː.nəz/',
    partOfSpeech: 'idiom',
    vietnameseMeaning: 'Làm ẩu, đi tắt đón đầu làm giảm chất lượng',
    exampleSentence: 'Never cut corners when it comes to user safety and software testing.',
    exampleTranslation: 'Đừng bao giờ làm ẩu khi nhắc đến an toàn của người dùng và kiểm thử phần mềm.',
    memoryTip: 'Cắt bớt các góc cua để đi nhanh hơn nhưng dễ xảy ra tai nạn.',
    collocations: ['cut corners on quality', 'refuse to cut corners'],
    level: 'B1-B2',
    category: 'idioms',
  },
  {
    word: 'on the same page',
    phonetic: '/ɒn ðə seɪm peɪdʒ/',
    partOfSpeech: 'idiom',
    vietnameseMeaning: 'Cùng chung suy nghĩ, thống nhất ý kiến',
    exampleSentence: 'Let us have a quick sync to make sure everyone is on the same page.',
    exampleTranslation: 'Hãy họp nhanh một chút để đảm bảo mọi người đều thống nhất ý kiến.',
    memoryTip: 'Cả nhóm cùng nhìn vào cùng 1 trang sách (page) thì sẽ không ai hiểu nhầm.',
    collocations: ['be on the same page', 'get everyone on the same page'],
    level: 'B1-B2',
    category: 'idioms',
  },
  {
    word: 'call it a day',
    phonetic: '/kɔːl ɪt ə deɪ/',
    partOfSpeech: 'idiom',
    vietnameseMeaning: 'Nghỉ tay, kết thúc công việc hôm nay',
    exampleSentence: "We've made great progress today, let's call it a day and grab dinner.",
    exampleTranslation: 'Hôm nay chúng ta tiến triển tốt rồi, hãy nghỉ tay và đi ăn tối nào.',
    memoryTip: 'Tuyên bố ngày làm việc coi như đã hoàn thành trọn vẹn.',
    collocations: ['ready to call it a day', 'decide to call it a day'],
    level: 'B1-B2',
    category: 'idioms',
  },

  // IELTS & C1-C2 Academic
  {
    word: 'ubiquitous',
    phonetic: '/juːˈbɪk.wɪ.təs/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Có mặt ở khắp nơi, phổ biến rộng rãi',
    exampleSentence: 'Smartphones have become ubiquitous in almost every modern society.',
    exampleTranslation: 'Điện thoại thông minh đã trở nên phổ biến ở khắp mọi xã hội hiện đại.',
    memoryTip: 'Từ vựng "vàng" trong IELTS Writing Task 2 thay thế cho "everywhere" hay "very common".',
    collocations: ['ubiquitous presence', 'become ubiquitous', 'almost ubiquitous'],
    level: 'IELTS',
    category: 'ielts',
  },
  {
    word: 'exacerbate',
    phonetic: '/ɪɡˈzæs.ə.beɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Làm trầm trọng thêm, làm tệ hại hơn (vấn đề)',
    exampleSentence: 'Traffic congestion only serves to exacerbate air pollution in big cities.',
    exampleTranslation: 'Tình trạng ùn tắc giao thông chỉ càng làm trầm trọng thêm ô nhiễm không khí ở các đô thị lớn.',
    memoryTip: 'Bắt nguồn từ "acer" (cay đắng, gắt gỏng) -> xát muối thêm vào vết thương.',
    collocations: ['exacerbate the problem', 'exacerbate symptoms', 'further exacerbate'],
    level: 'IELTS',
    category: 'ielts',
  },
  {
    word: 'meticulous',
    phonetic: '/məˈtɪk.jə.ləs/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Tỉ mỉ, cẩn thận từng chi tiết nhỏ',
    exampleSentence: 'The researcher kept meticulous records of all experimental procedures.',
    exampleTranslation: 'Nhà nghiên cứu đã ghi chép cực kỳ tỉ mỉ mọi quy trình thí nghiệm.',
    memoryTip: 'Tưởng tượng người thợ sửa đồng hồ cơ tỉ mỉ lắp từng bánh răng tí hon.',
    collocations: ['meticulous attention to detail', 'meticulous planning', 'meticulous research'],
    level: 'C1-C2',
    category: 'ielts',
  },
  {
    word: 'counterproductive',
    phonetic: '/ˌkaʊn.tə.prəˈdʌk.tɪv/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Phản tác dụng, đem lại kết quả ngược mong đợi',
    exampleSentence: 'Working eighty hours a week is actually counterproductive to long-term creativity.',
    exampleTranslation: 'Làm việc 80 tiếng một tuần thực chất gây phản tác dụng đối với sự sáng tạo lâu dài.',
    memoryTip: 'Counter (chống lại) + Productive (hiệu quả) = làm chỉ tổ phản tác dụng.',
    collocations: ['prove counterproductive', 'counterproductive measure', 'wholly counterproductive'],
    level: 'IELTS',
    category: 'ielts',
  },
  {
    word: 'scrutinize',
    phonetic: '/ˈskruː.tɪ.naɪz/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Soi xét kỹ lưỡng, kiểm tra ngặt nghèo',
    exampleSentence: 'Auditors will carefully scrutinize every financial transaction from last quarter.',
    exampleTranslation: 'Các kiểm toán viên sẽ soi xét kỹ lưỡng từng giao dịch tài chính của quý trước.',
    memoryTip: 'Nhớ kính hiển vi soi từng vi trùng nhỏ: scrutinize là soi xét cực kỳ chi tiết.',
    collocations: ['closely scrutinize', 'scrutinize the evidence', 'publicly scrutinized'],
    level: 'C1-C2',
    category: 'ielts',
  },

  // TOEIC & Business
  {
    word: 'implement',
    phonetic: '/ˈɪm.plɪ.ment/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Thực thi, triển khai áp dụng (kế hoạch, chính sách)',
    exampleSentence: 'The management board decided to implement the new remote work policy next month.',
    exampleTranslation: 'Ban giám đốc đã quyết định triển khai chính sách làm việc từ xa mới vào tháng tới.',
    memoryTip: 'Từ vựng cốt lõi của đề thi TOEIC: sau khi lên plan thì phải implement (thực thi).',
    collocations: ['implement a policy', 'implement changes', 'successfully implement'],
    level: 'TOEIC',
    category: 'work',
  },
  {
    word: 'negotiate',
    phonetic: '/nəˈɡəʊ.ʃi.eɪt/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Đàm phán, thương lượng điều khoản',
    exampleSentence: 'We managed to negotiate a 15% discount with our primary supplier.',
    exampleTranslation: 'Chúng tôi đã thương lượng thành công mức chiết khấu 15% với nhà cung cấp chính.',
    memoryTip: 'Cuộc đàm phán hợp đồng kinh doanh mang lại lợi ích cho cả hai bên.',
    collocations: ['negotiate a contract', 'negotiate a deal', 'negotiate terms'],
    level: 'Business',
    category: 'work',
  },
  {
    word: 'feasibility',
    phonetic: '/ˌfiː.zəˈbɪl.ə.ti/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Tính khả thi, khả năng thực hiện được',
    exampleSentence: 'The engineering team conducted a comprehensive feasibility study before breaking ground.',
    exampleTranslation: 'Đội ngũ kỹ sư đã tiến hành một nghiên cứu khả thi toàn diện trước khi khởi công.',
    memoryTip: 'Feasible (làm được) -> Feasibility là dự án có làm được thật hay chỉ nằm trên giấy.',
    collocations: ['feasibility study', 'assess feasibility', 'economic feasibility'],
    level: 'Business',
    category: 'work',
  },
  {
    word: 'streamline',
    phonetic: '/ˈstriːm.laɪn/',
    partOfSpeech: 'verb',
    vietnameseMeaning: 'Tinh gọn, hợp lý hóa quy trình để hiệu quả hơn',
    exampleSentence: 'Adopting AI tools helped our customer support team streamline ticket resolution.',
    exampleTranslation: 'Việc áp dụng công cụ AI đã giúp đội hỗ trợ khách hàng tinh gọn việc xử lý khiếu nại.',
    memoryTip: 'Dòng nước chảy thẳng (stream line) không vướng khúc mắc: quy trình trơn tru, tinh gọn.',
    collocations: ['streamline the process', 'streamline operations', 'streamline workflow'],
    level: 'Business',
    category: 'work',
  },
  {
    word: 'lucrative',
    phonetic: '/ˈluː.krə.tɪv/',
    partOfSpeech: 'adjective',
    vietnameseMeaning: 'Siêu lợi nhuận, sinh lời lớn',
    exampleSentence: 'Investing in clean renewable energy proved to be a highly lucrative venture.',
    exampleTranslation: 'Đầu tư vào năng lượng tái tạo sạch đã chứng minh là một thương vụ siêu sinh lời.',
    memoryTip: '"Luck" (may mắn) mang lại tiền tài: thương vụ béo bở đầy lợi nhuận.',
    collocations: ['lucrative deal', 'lucrative market', 'highly lucrative'],
    level: 'Business',
    category: 'work',
  },

  // Tech & Software
  {
    word: 'scalability',
    phonetic: '/ˌskeɪ.ləˈbɪl.ə.ti/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Khả năng mở rộng quy mô (hệ thống, ứng dụng)',
    exampleSentence: 'Cloud architecture ensures high scalability as our user base grows rapidly.',
    exampleTranslation: 'Kiến trúc đám mây đảm bảo khả năng mở rộng cao khi lượng người dùng tăng vọt.',
    memoryTip: 'Scale (cái thang mở rộng): hệ thống có thể mở rộng tải mà không bị sập.',
    collocations: ['system scalability', 'ensure scalability', 'high scalability'],
    level: 'B1-B2',
    category: 'tech',
  },
  {
    word: 'bottleneck',
    phonetic: '/ˈbɒt.əl.nek/',
    partOfSpeech: 'noun',
    vietnameseMeaning: 'Nút thắt cổ chai, điểm nghẽn làm chậm tiến độ',
    exampleSentence: 'Slow database queries were the main performance bottleneck in our backend.',
    exampleTranslation: 'Các truy vấn cơ sở dữ liệu chậm chạp là điểm nghẽn hiệu năng chính ở backend.',
    memoryTip: 'Cổ chai thắt hẹp lại khiến nước chảy chậm: chỗ làm kẹt cả quy trình.',
    collocations: ['bottleneck in production', 'identify a bottleneck', 'clear the bottleneck'],
    level: 'B1-B2',
    category: 'tech',
  },
];

/**
 * Filter curated cards when Gemini is unavailable or rate-limited
 */
export function getCuratedFallbackCards(
  level: string,
  categoryOrTopic: string,
  count: number,
  existingWords: string[] = []
): { topicTitle: string; level: string; cards: Omit<CuratedCardItem, 'category'>[] } {
  const existingSet = new Set(existingWords.map((w) => w.toLowerCase().trim()));

  // Normalize level
  const normalizedLevel = level.toUpperCase();

  // Try matching level
  let pool = CURATED_VOCABULARY.filter((card) => {
    if (existingSet.has(card.word.toLowerCase())) return false;
    if (normalizedLevel.includes('A1') || normalizedLevel.includes('A2')) {
      return card.level === 'A1-A2';
    }
    if (normalizedLevel.includes('C1') || normalizedLevel.includes('C2')) {
      return card.level === 'C1-C2' || card.level === 'IELTS';
    }
    if (normalizedLevel.includes('IELTS')) {
      return card.level === 'IELTS' || card.level === 'C1-C2';
    }
    if (normalizedLevel.includes('TOEIC')) {
      return card.level === 'TOEIC' || card.level === 'Business' || card.level === 'B1-B2';
    }
    if (normalizedLevel.includes('BUSINESS')) {
      return card.level === 'Business' || card.level === 'TOEIC';
    }
    // Default B1-B2
    return card.level === 'B1-B2' || card.level === 'A1-A2';
  });

  // If pool is too small, relax filter
  if (pool.length < count) {
    pool = CURATED_VOCABULARY.filter((card) => !existingSet.has(card.word.toLowerCase()));
  }

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Determine title
  const topicTitle = `Bộ từ vựng chất lượng (${level || 'B1-B2'})`;

  return {
    topicTitle,
    level,
    cards: selected.map(({ category, ...rest }) => rest),
  };
}
