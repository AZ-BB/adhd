-- Seed initial games
INSERT INTO games (type, name, name_ar, description, description_ar, difficulty_level, config) VALUES
-- Memory Games
('memory', 'Memory Match - Easy', 'لعبة الذاكرة - سهل', 'Match pairs of cards with 4 pairs', 'طابق أزواج البطاقات مع 4 أزواج', 1, '{"pairs": 4, "timeLimit": 60, "theme": "animals"}'),
('memory', 'Memory Match - Medium', 'لعبة الذاكرة - متوسط', 'Match pairs of cards with 6 pairs', 'طابق أزواج البطاقات مع 6 أزواج', 2, '{"pairs": 6, "timeLimit": 90, "theme": "shapes"}'),
('memory', 'Memory Match - Hard', 'لعبة الذاكرة - صعب', 'Match pairs of cards with 8 pairs', 'طابق أزواج البطاقات مع 8 أزواج', 3, '{"pairs": 8, "timeLimit": 120, "theme": "colors"}'),

-- Matching Games
('matching', 'Color Match', 'مطابقة الألوان', 'Match items with their correct colors', 'طابق العناصر مع ألوانها الصحيحة', 1, '{"itemCount": 5, "category": "colors"}'),
('matching', 'Shape Match', 'مطابقة الأشكال', 'Match shapes with their names', 'طابق الأشكال مع أسمائها', 1, '{"itemCount": 5, "category": "shapes"}'),
('matching', 'Animal Match', 'مطابقة الحيوانات', 'Match animals with their sounds', 'طابق الحيوانات مع أصواتها', 2, '{"itemCount": 6, "category": "animals"}'),

-- Sequence Games
('sequence', 'Number Sequence', 'تسلسل الأرقام', 'Arrange numbers in the correct order', 'رتب الأرقام بالترتيب الصحيح', 1, '{"numberCount": 5, "start": 1}'),
('sequence', 'Pattern Sequence', 'تسلسل الأنماط', 'Complete the pattern sequence', 'أكمل تسلسل النمط', 2, '{"patternLength": 4, "difficulty": "medium"}'),
('sequence', 'Color Sequence', 'تسلسل الألوان', 'Remember and repeat the color sequence', 'تذكر وكرر تسلسل الألوان', 2, '{"sequenceLength": 5, "colors": ["red", "blue", "green", "yellow"]}'),

-- Attention Games
('attention', 'Find the Difference', 'اعثر على الاختلاف', 'Find differences between two images', 'اعثر على الاختلافات بين صورتين', 2, '{"differences": 5, "timeLimit": 60}'),
('attention', 'Spot the Item', 'اكتشف العنصر', 'Find the specific item among distractions', 'اعثر على العنصر المحدد بين المشتتات', 1, '{"itemCount": 10, "targetCount": 3}'),
('attention', 'Focus Track', 'تتبع التركيز', 'Follow and click the moving target', 'تابع وانقر على الهدف المتحرك', 3, '{"duration": 30, "speed": "medium"}'),

-- Sorting Games
('sorting', 'Size Sort', 'ترتيب الحجم', 'Sort items by size from smallest to largest', 'رتب العناصر حسب الحجم من الأصغر إلى الأكبر', 1, '{"itemCount": 5, "category": "size"}'),
('sorting', 'Color Sort', 'ترتيب الألوان', 'Sort items by color groups', 'رتب العناصر حسب مجموعات الألوان', 1, '{"itemCount": 6, "colorGroups": 3}'),
('sorting', 'Category Sort', 'ترتيب الفئات', 'Sort items into correct categories', 'رتب العناصر في الفئات الصحيحة', 2, '{"itemCount": 8, "categories": 3}');

-- Seed initial learning days (30 days)
INSERT INTO learning_days (day_number, title, title_ar, description, description_ar, required_correct_games) VALUES
(1, 'Getting Started', 'البداية', 'Welcome! Start with easy games to warm up', 'مرحباً! ابدأ بألعاب سهلة للتسخين', 5),
(2, 'Memory Builder', 'بناء الذاكرة', 'Focus on improving your memory skills', 'ركز على تحسين مهارات الذاكرة', 5),
(3, 'Attention Focus', 'التركيز والانتباه', 'Practice keeping your attention on tasks', 'تدرب على الحفاظ على انتباهك على المهام', 5),
(4, 'Pattern Master', 'سيد الأنماط', 'Learn to recognize and complete patterns', 'تعلم التعرف على الأنماط وإكمالها', 5),
(5, 'Quick Thinking', 'التفكير السريع', 'Speed up your decision making', 'سرع من اتخاذ القرار', 5),
(6, 'Color Challenge', 'تحدي الألوان', 'Master color recognition and matching', 'أتقن التعرف على الألوان ومطابقتها', 5),
(7, 'Shape Explorer', 'مستكشف الأشكال', 'Learn about different shapes', 'تعلم عن الأشكال المختلفة', 5),
(8, 'Memory Pro', 'محترف الذاكرة', 'Take your memory skills to the next level', 'ارتقِ بمهارات الذاكرة إلى المستوى التالي', 5),
(9, 'Sorting Skills', 'مهارات الترتيب', 'Practice organizing and sorting', 'تدرب على التنظيم والترتيب', 5),
(10, 'Focus Champion', 'بطل التركيز', 'Become a focus expert', 'كن خبيراً في التركيز', 5),
(11, 'Advanced Memory', 'الذاكرة المتقدمة', 'Challenge your memory with harder games', 'تحدى ذاكرتك بألعاب أصعب', 5),
(12, 'Speed Round', 'جولة السرعة', 'Quick games to test your reflexes', 'ألعاب سريعة لاختبار ردود أفعالك', 5),
(13, 'Animal Kingdom', 'مملكة الحيوانات', 'Learn about animals through games', 'تعلم عن الحيوانات من خلال الألعاب', 5),
(14, 'Number Fun', 'متعة الأرقام', 'Practice with numbers and sequences', 'تدرب مع الأرقام والتسلسلات', 5),
(15, 'Attention Master', 'سيد الانتباه', 'Master the art of staying focused', 'أتقن فن الحفاظ على التركيز', 5),
(16, 'Mixed Challenge', 'التحدي المختلط', 'Mix of all game types', 'مزيج من جميع أنواع الألعاب', 5),
(17, 'Pattern Pro', 'محترف الأنماط', 'Advanced pattern recognition', 'التعرف المتقدم على الأنماط', 5),
(18, 'Memory Marathon', 'ماراثون الذاكرة', 'Extended memory challenges', 'تحديات الذاكرة الممتدة', 5),
(19, 'Visual Skills', 'المهارات البصرية', 'Improve visual processing', 'حسّن المعالجة البصرية', 5),
(20, 'Brain Boost', 'تعزيز الدماغ', 'Boost your brain power', 'عزز قوة دماغك', 5),
(21, 'Concentration Camp', 'معسكر التركيز', 'Intensive focus training', 'تدريب مكثف على التركيز', 5),
(22, 'Creative Thinking', 'التفكير الإبداعي', 'Think outside the box', 'فكر خارج الصندوق', 5),
(23, 'Speed Master', 'سيد السرعة', 'Master fast decision making', 'أتقن اتخاذ القرارات السريعة', 5),
(24, 'Challenge Day', 'يوم التحدي', 'Take on the toughest challenges', 'تحدى نفسك بأصعب التحديات', 5),
(25, 'Review Day', 'يوم المراجعة', 'Review what you have learned', 'راجع ما تعلمته', 5),
(26, 'Expert Mode', 'وضع الخبير', 'Expert level challenges', 'تحديات مستوى الخبراء', 5),
(27, 'Final Push', 'الدفعة النهائية', 'Almost there! Keep going', 'أنت قريب! استمر', 5),
(28, 'Grand Challenge', 'التحدي الكبير', 'The ultimate test', 'الاختبار النهائي', 5),
(29, 'Victory Lap', 'لفة النصر', 'Show what you have learned', 'اظهر ما تعلمته', 5),
(30, 'Graduation Day', 'يوم التخرج', 'Congratulations on completing all days!', 'مبروك على إكمال جميع الأيام!', 5);

-- Link games to Day 1 (Getting Started - Easy games)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(1, 1, 1),  -- Memory Match - Easy
(1, 4, 2),  -- Color Match
(1, 5, 3),  -- Shape Match
(1, 7, 4),  -- Number Sequence
(1, 11, 5); -- Spot the Item

-- Link games to Day 2 (Memory Builder)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(2, 1, 1),  -- Memory Match - Easy
(2, 2, 2),  -- Memory Match - Medium
(2, 9, 3),  -- Color Sequence
(2, 4, 4),  -- Color Match
(2, 7, 5);  -- Number Sequence

-- Link games to Day 3 (Attention Focus)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(3, 10, 1), -- Find the Difference
(3, 11, 2), -- Spot the Item
(3, 12, 3), -- Focus Track
(3, 1, 4),  -- Memory Match - Easy
(3, 4, 5);  -- Color Match

-- Link games to Day 4 (Pattern Master)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(4, 8, 1),  -- Pattern Sequence
(4, 7, 2),  -- Number Sequence
(4, 9, 3),  -- Color Sequence
(4, 2, 4),  -- Memory Match - Medium
(4, 14, 5); -- Color Sort

-- Link games to Day 5 (Quick Thinking)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(5, 12, 1), -- Focus Track
(5, 11, 2), -- Spot the Item
(5, 2, 3),  -- Memory Match - Medium
(5, 6, 4),  -- Animal Match
(5, 8, 5);  -- Pattern Sequence

-- Link games to Day 6 (Color Challenge)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(6, 4, 1),  -- Color Match
(6, 9, 2),  -- Color Sequence
(6, 14, 3), -- Color Sort
(6, 2, 4),  -- Memory Match - Medium (color theme)
(6, 10, 5); -- Find the Difference

-- Link games to Day 7 (Shape Explorer)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(7, 5, 1),  -- Shape Match
(7, 13, 2), -- Size Sort
(7, 15, 3), -- Category Sort
(7, 2, 4),  -- Memory Match - Medium (shapes theme)
(7, 11, 5); -- Spot the Item

-- Link games to Day 8 (Memory Pro)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(8, 2, 1),  -- Memory Match - Medium
(8, 3, 2),  -- Memory Match - Hard
(8, 9, 3),  -- Color Sequence
(8, 6, 4),  -- Animal Match
(8, 8, 5);  -- Pattern Sequence

-- Link games to Day 9 (Sorting Skills)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(9, 13, 1), -- Size Sort
(9, 14, 2), -- Color Sort
(9, 15, 3), -- Category Sort
(9, 7, 4),  -- Number Sequence
(9, 2, 5);  -- Memory Match - Medium

-- Link games to Day 10 (Focus Champion)
INSERT INTO day_games (learning_day_id, game_id, order_in_day) VALUES
(10, 12, 1), -- Focus Track
(10, 10, 2), -- Find the Difference
(10, 11, 3), -- Spot the Item
(10, 3, 4),  -- Memory Match - Hard
(10, 8, 5);  -- Pattern Sequence

