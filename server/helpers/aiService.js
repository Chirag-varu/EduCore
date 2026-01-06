/**
 * AI Service for Quiz Generation and Answer Evaluation
 * Supports OpenAI GPT and Google Gemini APIs
 */

// Try to use OpenAI if available, fallback to Gemini
let openai = null;
let genAI = null;

// Dynamic import for OpenAI
const initOpenAI = async () => {
  if (process.env.OPENAI_API_KEY) {
    try {
      const OpenAI = (await import('openai')).default;
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      console.log('✅ OpenAI initialized');
      return true;
    } catch (e) {
      console.log('OpenAI not available:', e.message);
    }
  }
  return false;
};

// Dynamic import for Google Gemini
const initGemini = async () => {
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      console.log('✅ Google Gemini initialized');
      return true;
    } catch (e) {
      console.log('Gemini not available:', e.message);
    }
  }
  return false;
};

// Initialize AI services
export const initAI = async () => {
  const hasOpenAI = await initOpenAI();
  const hasGemini = await initGemini();
  
  if (!hasOpenAI && !hasGemini) {
    console.log('⚠️ No AI service configured. Add OPENAI_API_KEY or GEMINI_API_KEY to .env');
    return false;
  }
  return true;
};

/**
 * Generate quiz questions based on course content
 * @param {Object} courseData - Course information
 * @param {number} questionCount - Number of questions to generate
 * @returns {Array} Array of question objects
 */
export const generateQuizQuestions = async (courseData, questionCount = 10) => {
  const { title, description, category, objectives, curriculum } = courseData;
  
  // Build context from course data
  const lectureTopics = curriculum?.map(lecture => lecture.title).join(', ') || '';
  
  const prompt = `You are an expert exam creator for professional certification tests. Generate ${questionCount} challenging quiz questions for a course completion assessment.

Course Details:
- Title: ${title}
- Category: ${category}
- Description: ${description || 'N/A'}
- Learning Objectives: ${objectives || 'N/A'}
- Topics Covered: ${lectureTopics}

CRITICAL REQUIREMENTS:

1. **Question Types Distribution:**
   - 5 multiple-choice questions (4 options each, only ONE correct)
   - 2 true/false questions
   - 3 short-answer questions (technical terms, 1-3 words max)

2. **Difficulty Distribution (MUST FOLLOW):**
   - 2 EASY questions (basic recall, definitions)
   - 5 MEDIUM questions (application, understanding concepts)
   - 3 HARD questions (analysis, tricky scenarios, edge cases)

3. **Question Quality Standards:**
   - Questions must be like REAL exam questions (similar to certification exams, interview questions, or university tests)
   - Include practical scenarios and code-related questions if technical course
   - Use tricky distractors in multiple choice (common misconceptions)
   - Hard questions should test deep understanding, not just memorization
   - Include "which of the following is NOT" or "all EXCEPT" style questions
   - Include questions about best practices, common mistakes, and edge cases

4. **For Technical/Programming Courses, include:**
   - Code output prediction questions
   - "What's wrong with this code" questions
   - Time/Space complexity questions
   - Best practice questions
   - Common interview-style questions

5. **For Non-Technical Courses, include:**
   - Case study based questions
   - Application of concepts to real scenarios
   - Compare and contrast questions
   - Cause and effect questions

6. **Make questions challenging but fair:**
   - Avoid obvious wrong answers
   - All distractors should be plausible
   - Test understanding, not trick questions with wordplay

Return ONLY a valid JSON array with this exact structure (no markdown, no code blocks, no explanations outside JSON):
[
  {
    "type": "multiple-choice",
    "question": "In JavaScript, what is the output of: console.log(typeof null)?",
    "options": [
      {"text": "null", "isCorrect": false},
      {"text": "undefined", "isCorrect": false},
      {"text": "object", "isCorrect": true},
      {"text": "NullType", "isCorrect": false}
    ],
    "explanation": "This is a known JavaScript quirk - typeof null returns 'object' due to a legacy bug in the language.",
    "points": 2,
    "difficulty": "hard"
  },
  {
    "type": "true-false",
    "question": "In React, useEffect with an empty dependency array runs on every render.",
    "options": [
      {"text": "True", "isCorrect": false},
      {"text": "False", "isCorrect": true}
    ],
    "explanation": "useEffect with [] runs only once on mount, not on every render.",
    "points": 1,
    "difficulty": "medium"
  },
  {
    "type": "short-answer",
    "question": "What Big O notation represents constant time complexity?",
    "correctAnswer": "O(1)",
    "explanation": "O(1) represents constant time - the operation takes the same time regardless of input size.",
    "points": 2,
    "difficulty": "easy"
  }
]

Generate questions that would genuinely test if someone learned from the "${title}" course. Make them realistic exam questions!`;

  try {
    let responseText;

    if (openai) {
      // Use OpenAI
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an expert exam creator who writes challenging, professional-level quiz questions similar to certification exams and technical interviews. Always respond with valid JSON only, no markdown formatting.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 4000
      });
      responseText = completion.choices[0].message.content;
    } else if (genAI) {
      // Use Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } else {
      // Fallback: Generate topic-specific questions without AI
      return generateFallbackQuestions(courseData, questionCount);
    }

    // Parse the response
    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const questions = JSON.parse(cleanedResponse);
    return questions;
  } catch (error) {
    console.error('AI Quiz Generation Error:', error);
    // Fallback to basic questions
    return generateFallbackQuestions(courseData, questionCount);
  }
};

/**
 * Evaluate a short-answer response using AI
 * @param {string} question - The question asked
 * @param {string} correctAnswer - The expected answer
 * @param {string} studentAnswer - The student's response
 * @returns {Object} Evaluation result with score and feedback
 */
export const evaluateAnswer = async (question, correctAnswer, studentAnswer) => {
  if (!studentAnswer || studentAnswer.trim() === '') {
    return {
      isCorrect: false,
      score: 0,
      feedback: 'No answer provided'
    };
  }

  // For simple matching, check if answers are similar
  const normalizedCorrect = correctAnswer.toLowerCase().trim();
  const normalizedStudent = studentAnswer.toLowerCase().trim();
  
  // Exact or close match
  if (normalizedStudent === normalizedCorrect) {
    return { isCorrect: true, score: 1, feedback: 'Correct!' };
  }

  // Check if one contains the other
  if (normalizedCorrect.includes(normalizedStudent) || normalizedStudent.includes(normalizedCorrect)) {
    return { isCorrect: true, score: 0.8, feedback: 'Mostly correct!' };
  }

  // Use AI for more nuanced evaluation
  const prompt = `Evaluate this student answer:

Question: ${question}
Expected Answer: ${correctAnswer}
Student Answer: ${studentAnswer}

Evaluate if the student's answer is correct, partially correct, or incorrect.
Consider synonyms, different phrasings, and semantic meaning.

Respond with ONLY valid JSON (no markdown):
{
  "isCorrect": true/false,
  "score": 0.0 to 1.0,
  "feedback": "Brief feedback explaining the evaluation"
}`;

  try {
    let responseText;

    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a fair and accurate grader. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 200
      });
      responseText = completion.choices[0].message.content;
    } else if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      responseText = result.response.text();
    } else {
      // Simple string comparison fallback
      const similarity = calculateSimilarity(normalizedCorrect, normalizedStudent);
      return {
        isCorrect: similarity > 0.7,
        score: similarity,
        feedback: similarity > 0.7 ? 'Answer accepted' : 'Answer does not match expected response'
      };
    }

    const cleanedResponse = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('AI Evaluation Error:', error);
    // Fallback to simple comparison
    const similarity = calculateSimilarity(normalizedCorrect, normalizedStudent);
    return {
      isCorrect: similarity > 0.6,
      score: similarity,
      feedback: 'Auto-evaluated based on text similarity'
    };
  }
};

/**
 * Calculate string similarity using Levenshtein distance
 */
const calculateSimilarity = (str1, str2) => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1, str2) => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

/**
 * Generate fallback questions when AI is not available
 * These are topic-specific, exam-style questions
 */
const generateFallbackQuestions = (courseData, count) => {
  const { title, category } = courseData;
  const lowerTitle = title.toLowerCase();
  const lowerCategory = (category || '').toLowerCase();
  
  // Topic-specific question banks
  const questionBanks = {
    javascript: [
      {
        type: 'multiple-choice',
        question: 'What is the output of: console.log(typeof null)?',
        options: [
          { text: 'null', isCorrect: false },
          { text: 'undefined', isCorrect: false },
          { text: 'object', isCorrect: true },
          { text: 'NullType', isCorrect: false }
        ],
        explanation: 'typeof null returns "object" - this is a known JavaScript bug from the first implementation.',
        points: 2,
        difficulty: 'hard'
      },
      {
        type: 'multiple-choice',
        question: 'What will [1, 2, 3].map(parseInt) return?',
        options: [
          { text: '[1, 2, 3]', isCorrect: false },
          { text: '[1, NaN, NaN]', isCorrect: true },
          { text: '[NaN, NaN, NaN]', isCorrect: false },
          { text: 'Error', isCorrect: false }
        ],
        explanation: 'map passes (value, index, array) to callback. parseInt uses the index as radix, causing unexpected results.',
        points: 2,
        difficulty: 'hard'
      },
      {
        type: 'multiple-choice',
        question: 'Which method does NOT mutate the original array?',
        options: [
          { text: 'push()', isCorrect: false },
          { text: 'splice()', isCorrect: false },
          { text: 'map()', isCorrect: true },
          { text: 'sort()', isCorrect: false }
        ],
        explanation: 'map() returns a new array without modifying the original. push, splice, and sort mutate the array.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'What is the difference between == and === in JavaScript?',
        options: [
          { text: 'No difference', isCorrect: false },
          { text: '=== checks type and value, == only checks value with type coercion', isCorrect: true },
          { text: '== is faster than ===', isCorrect: false },
          { text: '=== is deprecated', isCorrect: false }
        ],
        explanation: '=== (strict equality) checks both type and value without coercion.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'true-false',
        question: 'In JavaScript, "let" and "const" are hoisted but not initialized (temporal dead zone).',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'let/const are hoisted but accessing them before declaration causes ReferenceError (TDZ).',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'true-false',
        question: 'Arrow functions have their own "this" context.',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'Arrow functions inherit "this" from the enclosing scope (lexical this).',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What keyword is used to handle errors in async/await?',
        correctAnswer: 'try-catch',
        explanation: 'try-catch blocks are used to handle errors in async/await code.',
        points: 2,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the time complexity of Array.prototype.includes()?',
        options: [
          { text: 'O(1)', isCorrect: false },
          { text: 'O(n)', isCorrect: true },
          { text: 'O(log n)', isCorrect: false },
          { text: 'O(n²)', isCorrect: false }
        ],
        explanation: 'includes() iterates through the array, making it O(n) linear time.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What method converts a JSON string to a JavaScript object?',
        correctAnswer: 'JSON.parse',
        explanation: 'JSON.parse() parses a JSON string and returns a JavaScript object.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'Which statement about closures is TRUE?',
        options: [
          { text: 'Closures can only access global variables', isCorrect: false },
          { text: 'A closure gives access to an outer function\'s scope from an inner function', isCorrect: true },
          { text: 'Closures are created only with arrow functions', isCorrect: false },
          { text: 'Closures prevent garbage collection of all variables', isCorrect: false }
        ],
        explanation: 'A closure is created when an inner function has access to variables from its outer function\'s scope.',
        points: 2,
        difficulty: 'medium'
      }
    ],
    
    react: [
      {
        type: 'multiple-choice',
        question: 'What happens when you call setState() in React?',
        options: [
          { text: 'Component re-renders immediately synchronously', isCorrect: false },
          { text: 'State update is batched and component may re-render asynchronously', isCorrect: true },
          { text: 'Only the changed value updates without re-render', isCorrect: false },
          { text: 'Parent component re-renders first', isCorrect: false }
        ],
        explanation: 'React batches state updates for performance and re-renders asynchronously.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'useEffect with an empty dependency array [] is equivalent to:',
        options: [
          { text: 'componentDidUpdate', isCorrect: false },
          { text: 'componentDidMount', isCorrect: true },
          { text: 'componentWillUnmount', isCorrect: false },
          { text: 'shouldComponentUpdate', isCorrect: false }
        ],
        explanation: 'useEffect with [] runs once after initial render, like componentDidMount.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'Why should you NOT call hooks inside loops, conditions, or nested functions?',
        options: [
          { text: 'It causes syntax errors', isCorrect: false },
          { text: 'React relies on call order to track hooks between renders', isCorrect: true },
          { text: 'Hooks only work at component level', isCorrect: false },
          { text: 'It makes the code slower', isCorrect: false }
        ],
        explanation: 'React uses hook call order to associate state with components. Conditional calls break this.',
        points: 2,
        difficulty: 'hard'
      },
      {
        type: 'true-false',
        question: 'In React, keys help identify which items have changed, are added, or removed.',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'Keys give elements a stable identity for efficient reconciliation.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'true-false',
        question: 'useCallback and useMemo serve the exact same purpose.',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'useCallback memoizes functions, useMemo memoizes computed values.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What hook is used to access context values in functional components?',
        correctAnswer: 'useContext',
        explanation: 'useContext hook allows functional components to consume context.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the Virtual DOM?',
        options: [
          { text: 'A browser API for faster rendering', isCorrect: false },
          { text: 'A lightweight copy of the real DOM for efficient updates', isCorrect: true },
          { text: 'A CSS optimization technique', isCorrect: false },
          { text: 'A database for storing component state', isCorrect: false }
        ],
        explanation: 'Virtual DOM is a JS representation of the real DOM that React uses to compute minimal updates.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What function is used to create a reference to a DOM element in React?',
        correctAnswer: 'useRef',
        explanation: 'useRef creates a mutable ref object to access DOM elements directly.',
        points: 2,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'Which is TRUE about React.memo()?',
        options: [
          { text: 'It memoizes component state', isCorrect: false },
          { text: 'It prevents re-render if props haven\'t changed (shallow comparison)', isCorrect: true },
          { text: 'It replaces shouldComponentUpdate completely', isCorrect: false },
          { text: 'It only works with class components', isCorrect: false }
        ],
        explanation: 'React.memo is a HOC that skips re-render if props are shallowly equal.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'What causes an infinite loop with useEffect?',
        options: [
          { text: 'Not returning a cleanup function', isCorrect: false },
          { text: 'Updating state that is in the dependency array without conditions', isCorrect: true },
          { text: 'Using async functions directly', isCorrect: false },
          { text: 'Having too many dependencies', isCorrect: false }
        ],
        explanation: 'If you update a dependency inside useEffect without conditions, it triggers infinite re-renders.',
        points: 2,
        difficulty: 'hard'
      }
    ],
    
    dsa: [
      {
        type: 'multiple-choice',
        question: 'What is the time complexity of binary search?',
        options: [
          { text: 'O(n)', isCorrect: false },
          { text: 'O(log n)', isCorrect: true },
          { text: 'O(n log n)', isCorrect: false },
          { text: 'O(1)', isCorrect: false }
        ],
        explanation: 'Binary search halves the search space each iteration, giving O(log n).',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'Which data structure uses LIFO (Last In, First Out)?',
        options: [
          { text: 'Queue', isCorrect: false },
          { text: 'Stack', isCorrect: true },
          { text: 'Linked List', isCorrect: false },
          { text: 'Heap', isCorrect: false }
        ],
        explanation: 'Stack follows LIFO - the last element added is the first to be removed.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the worst-case time complexity of QuickSort?',
        options: [
          { text: 'O(n)', isCorrect: false },
          { text: 'O(n log n)', isCorrect: false },
          { text: 'O(n²)', isCorrect: true },
          { text: 'O(log n)', isCorrect: false }
        ],
        explanation: 'QuickSort degrades to O(n²) when the pivot selection is poor (already sorted array).',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'Which algorithm is best for finding shortest path in unweighted graph?',
        options: [
          { text: 'DFS', isCorrect: false },
          { text: 'BFS', isCorrect: true },
          { text: 'Dijkstra', isCorrect: false },
          { text: 'Bellman-Ford', isCorrect: false }
        ],
        explanation: 'BFS explores level by level, guaranteeing shortest path in unweighted graphs.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'true-false',
        question: 'A balanced BST has O(log n) search time complexity.',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'Balanced BST maintains height ~log n, giving O(log n) search.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'true-false',
        question: 'HashMaps always have O(1) time complexity for operations.',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'Average case is O(1), but worst case (many collisions) is O(n).',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What is the space complexity of merge sort?',
        correctAnswer: 'O(n)',
        explanation: 'Merge sort requires O(n) auxiliary space for merging.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'Which traversal of BST gives sorted output?',
        options: [
          { text: 'Preorder', isCorrect: false },
          { text: 'Inorder', isCorrect: true },
          { text: 'Postorder', isCorrect: false },
          { text: 'Level order', isCorrect: false }
        ],
        explanation: 'Inorder traversal (left-root-right) of BST produces sorted sequence.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What data structure is used to implement recursion internally?',
        correctAnswer: 'stack',
        explanation: 'The call stack stores function calls and local variables during recursion.',
        points: 2,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the time complexity of inserting at the beginning of an ArrayList?',
        options: [
          { text: 'O(1)', isCorrect: false },
          { text: 'O(n)', isCorrect: true },
          { text: 'O(log n)', isCorrect: false },
          { text: 'O(n²)', isCorrect: false }
        ],
        explanation: 'Inserting at beginning requires shifting all elements, making it O(n).',
        points: 2,
        difficulty: 'hard'
      }
    ],
    
    python: [
      {
        type: 'multiple-choice',
        question: 'What is the output of: print([1,2,3][-1])?',
        options: [
          { text: '1', isCorrect: false },
          { text: '3', isCorrect: true },
          { text: 'Error', isCorrect: false },
          { text: '-1', isCorrect: false }
        ],
        explanation: 'Negative indexing in Python accesses from the end. -1 is the last element.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the difference between a list and a tuple in Python?',
        options: [
          { text: 'Lists are faster', isCorrect: false },
          { text: 'Tuples are mutable, lists are not', isCorrect: false },
          { text: 'Lists are mutable, tuples are immutable', isCorrect: true },
          { text: 'No difference', isCorrect: false }
        ],
        explanation: 'Lists can be modified after creation, tuples cannot.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What does the "self" parameter represent in a class method?',
        options: [
          { text: 'The class itself', isCorrect: false },
          { text: 'The instance of the class', isCorrect: true },
          { text: 'A required Python keyword', isCorrect: false },
          { text: 'The parent class', isCorrect: false }
        ],
        explanation: 'self refers to the current instance of the class.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'true-false',
        question: 'In Python, dictionaries maintain insertion order (Python 3.7+).',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'Since Python 3.7, dicts officially maintain insertion order.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What keyword is used to define a generator function in Python?',
        correctAnswer: 'yield',
        explanation: 'yield makes a function a generator, returning values lazily.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'What is a decorator in Python?',
        options: [
          { text: 'A way to add comments', isCorrect: false },
          { text: 'A function that modifies another function', isCorrect: true },
          { text: 'A type of loop', isCorrect: false },
          { text: 'A class inheritance method', isCorrect: false }
        ],
        explanation: 'Decorators wrap functions to extend their behavior without modifying them.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'What does *args allow in a function definition?',
        options: [
          { text: 'Pass a dictionary', isCorrect: false },
          { text: 'Pass any number of positional arguments', isCorrect: true },
          { text: 'Make arguments optional', isCorrect: false },
          { text: 'Define default values', isCorrect: false }
        ],
        explanation: '*args collects extra positional arguments as a tuple.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'true-false',
        question: 'List comprehensions are generally faster than equivalent for loops in Python.',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'List comprehensions are optimized at C level, making them faster.',
        points: 1,
        difficulty: 'hard'
      },
      {
        type: 'short-answer',
        question: 'What built-in function returns the length of an object?',
        correctAnswer: 'len',
        explanation: 'len() returns the number of items in a sequence or collection.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the GIL in Python?',
        options: [
          { text: 'A graphics library', isCorrect: false },
          { text: 'Global Interpreter Lock - prevents true multi-threading', isCorrect: true },
          { text: 'A garbage collector', isCorrect: false },
          { text: 'A package manager', isCorrect: false }
        ],
        explanation: 'GIL allows only one thread to execute Python bytecode at a time.',
        points: 2,
        difficulty: 'hard'
      }
    ],
    
    webdev: [
      {
        type: 'multiple-choice',
        question: 'Which HTTP status code indicates "Not Found"?',
        options: [
          { text: '200', isCorrect: false },
          { text: '404', isCorrect: true },
          { text: '500', isCorrect: false },
          { text: '302', isCorrect: false }
        ],
        explanation: '404 indicates the requested resource was not found on the server.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is the purpose of the "alt" attribute in an <img> tag?',
        options: [
          { text: 'Styling the image', isCorrect: false },
          { text: 'Alternative text for accessibility and when image fails to load', isCorrect: true },
          { text: 'Adding animation', isCorrect: false },
          { text: 'Linking to another page', isCorrect: false }
        ],
        explanation: 'alt provides text description for screen readers and when images don\'t load.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What is CORS?',
        options: [
          { text: 'A CSS framework', isCorrect: false },
          { text: 'Cross-Origin Resource Sharing - security mechanism for cross-domain requests', isCorrect: true },
          { text: 'A JavaScript library', isCorrect: false },
          { text: 'A database protocol', isCorrect: false }
        ],
        explanation: 'CORS allows or restricts web pages from making requests to different domains.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'true-false',
        question: 'localStorage data persists even after the browser is closed.',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'localStorage has no expiration, unlike sessionStorage which clears on tab close.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'true-false',
        question: 'REST APIs must always use JSON format for data exchange.',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'REST can use any format (JSON, XML, plain text). JSON is just popular.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What HTTP method is typically used to update an existing resource?',
        correctAnswer: 'PUT',
        explanation: 'PUT is used to update/replace a resource. PATCH is for partial updates.',
        points: 1,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'What is XSS?',
        options: [
          { text: 'Extra Style Sheets', isCorrect: false },
          { text: 'Cross-Site Scripting - injecting malicious scripts', isCorrect: true },
          { text: 'XML Secure Socket', isCorrect: false },
          { text: 'Extended Server System', isCorrect: false }
        ],
        explanation: 'XSS attacks inject malicious scripts into trusted websites.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'multiple-choice',
        question: 'Which is NOT a valid CSS position value?',
        options: [
          { text: 'relative', isCorrect: false },
          { text: 'absolute', isCorrect: false },
          { text: 'static', isCorrect: false },
          { text: 'float', isCorrect: true }
        ],
        explanation: 'float is a separate CSS property, not a position value.',
        points: 2,
        difficulty: 'medium'
      },
      {
        type: 'short-answer',
        question: 'What CSS property is used to create flexible layouts?',
        correctAnswer: 'flexbox',
        explanation: 'display: flex creates a flex container for flexible layouts.',
        points: 2,
        difficulty: 'easy'
      },
      {
        type: 'multiple-choice',
        question: 'What does the "async" attribute do on a script tag?',
        options: [
          { text: 'Makes the script run synchronously', isCorrect: false },
          { text: 'Downloads script asynchronously and executes immediately when ready', isCorrect: true },
          { text: 'Delays script until page loads', isCorrect: false },
          { text: 'Prevents script from running', isCorrect: false }
        ],
        explanation: 'async downloads the script without blocking and executes as soon as it\'s ready.',
        points: 2,
        difficulty: 'hard'
      }
    ],
    
    default: [
      {
        type: 'multiple-choice',
        question: `What is the primary focus of "${title}"?`,
        options: [
          { text: category || 'Main Subject', isCorrect: true },
          { text: 'Unrelated Topic A', isCorrect: false },
          { text: 'Unrelated Topic B', isCorrect: false },
          { text: 'None of the above', isCorrect: false }
        ],
        explanation: `This course focuses on ${category || 'the main subject'}`,
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'true-false',
        question: 'Practical application of concepts is important for mastering any subject.',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'Practice helps reinforce theoretical knowledge.',
        points: 1,
        difficulty: 'easy'
      },
      {
        type: 'short-answer',
        question: 'What is the title of this course?',
        correctAnswer: title,
        explanation: `The course is titled "${title}"`,
        points: 1,
        difficulty: 'easy'
      }
    ]
  };
  
  // Detect course topic and get appropriate questions
  let selectedBank = questionBanks.default;
  
  if (lowerTitle.includes('javascript') || lowerTitle.includes('js') || lowerCategory.includes('javascript')) {
    selectedBank = questionBanks.javascript;
  } else if (lowerTitle.includes('react') || lowerCategory.includes('react')) {
    selectedBank = questionBanks.react;
  } else if (lowerTitle.includes('data structure') || lowerTitle.includes('algorithm') || lowerTitle.includes('dsa')) {
    selectedBank = questionBanks.dsa;
  } else if (lowerTitle.includes('python') || lowerCategory.includes('python')) {
    selectedBank = questionBanks.python;
  } else if (lowerTitle.includes('web') || lowerTitle.includes('html') || lowerTitle.includes('css') || lowerCategory.includes('web')) {
    selectedBank = questionBanks.webdev;
  }
  
  // Shuffle and return requested number of questions
  const shuffled = [...selectedBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export default {
  initAI,
  generateQuizQuestions,
  evaluateAnswer
};
