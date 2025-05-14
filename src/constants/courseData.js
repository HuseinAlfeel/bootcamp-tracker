const courseModules = [
  {
    id: 1,
    title: "Front-End Web Development",
    category: "Front-End Fundamentals",
    description: "Introduction to front-end web development concepts"
  },
  {
    id: 2,
    title: "Introduction to HTML",
    category: "Front-End Fundamentals",
    description: "Learning HTML basics and document structure"
  },
  {
    id: 3,
    title: "Intermediate HTML",
    category: "Front-End Fundamentals",
    description: "Advanced HTML elements and semantic markup"
  },
  {
    id: 4,
    title: "Multi-Page Websites",
    category: "Front-End Fundamentals",
    description: "Creating and linking multiple HTML pages"
  },
  {
    id: 5,
    title: "Introduction to CSS",
    category: "Front-End Fundamentals",
    description: "Basics of styling web pages with CSS"
  },
  {
    id: 6,
    title: "CSS Properties",
    category: "Front-End Fundamentals",
    description: "Working with various CSS properties and values"
  },
  {
    id: 7,
    title: "Intermediate CSS",
    category: "Front-End Fundamentals",
    description: "Advanced CSS techniques and selectors"
  },
  {
    id: 8,
    title: "Advanced CSS",
    category: "Front-End Fundamentals",
    description: "Complex CSS layouts and animations"
  },
  {
    id: 9,
    title: "Flexbox",
    category: "Front-End Fundamentals",
    description: "Creating flexible layouts with CSS Flexbox"
  },
  {
    id: 10,
    title: "Grid",
    category: "Front-End Fundamentals",
    description: "Building grid-based layouts with CSS Grid"
  },
  {
    id: 11,
    title: "Bootstrap",
    category: "Front-End Fundamentals",
    description: "Using the Bootstrap framework for responsive design"
  },
  {
    id: 12,
    title: "Web Design School - Create a Website that People Love",
    category: "Front-End Fundamentals",
    description: "Principles of effective web design and user experience"
  },
  {
    id: 13,
    title: "Capstone Project 2 - Personal Site",
    category: "Front-End Fundamentals",
    description: "Building a complete personal website project"
  },
  {
    id: 14,
    title: "Introduction to Javascript ES6",
    category: "JavaScript & DOM",
    description: "Learning JavaScript fundamentals and ES6 features"
  },
  {
    id: 15,
    title: "Intermediate Javascript",
    category: "JavaScript & DOM",
    description: "Advanced JavaScript concepts and programming techniques"
  },
  {
    id: 16,
    title: "The Document Object Model (DOM)",
    category: "JavaScript & DOM",
    description: "Manipulating HTML documents with JavaScript"
  },
  {
    id: 17,
    title: "Boss Level Challenge 1 - The Dicee Game",
    category: "JavaScript & DOM",
    description: "Creating an interactive dice game with JavaScript"
  },
  {
    id: 18,
    title: "Advanced Javascript and DOM Manipulation",
    category: "JavaScript & DOM",
    description: "Complex DOM manipulation and event handling"
  },
  {
    id: 19,
    title: "jQuery",
    category: "JavaScript & DOM",
    description: "Using jQuery to simplify JavaScript development"
  },
  {
    id: 20,
    title: "Boss Level Challenge 2 - The Simon Game",
    category: "JavaScript & DOM",
    description: "Building a memory game with advanced JavaScript"
  },
  {
    id: 21,
    title: "The Unix Command Line",
    category: "Backend Development",
    description: "Learning essential command line skills for developers"
  },
  {
    id: 22,
    title: "Backend Web Development",
    category: "Backend Development",
    description: "Introduction to server-side programming"
  },
  {
    id: 23,
    title: "Node.js",
    category: "Backend Development",
    description: "Building server-side applications with Node.js"
  },
  {
    id: 24,
    title: "Express.js with Node.js",
    category: "Backend Development",
    description: "Creating web applications with the Express framework"
  },
  {
    id: 25,
    title: "APIs - Application Programming Interfaces",
    category: "Backend Development",
    description: "Working with and creating RESTful APIs"
  },
  {
    id: 26,
    title: "Git, Github and Version Control",
    category: "Backend Development",
    description: "Managing code with version control systems"
  },
  {
    id: 27,
    title: "EJS",
    category: "Backend Development",
    description: "Using Embedded JavaScript templates for dynamic content"
  },
  {
    id: 28,
    title: "Boss Level Challenge 3 - Blog Website",
    category: "Backend Development",
    description: "Creating a full-featured blog with Node.js"
  },
  {
    id: 29,
    title: "Databases",
    category: "Databases & Full Stack",
    description: "Introduction to database concepts and systems"
  },
  {
    id: 30,
    title: "SQL",
    category: "Databases & Full Stack",
    description: "Working with relational databases and SQL"
  },
  {
    id: 31,
    title: "MongoDB",
    category: "Databases & Full Stack",
    description: "Using MongoDB NoSQL database"
  },
  {
    id: 32,
    title: "Mongoose",
    category: "Databases & Full Stack",
    description: "MongoDB object modeling for Node.js"
  },
  {
    id: 33,
    title: "Putting Everything Together",
    category: "Databases & Full Stack",
    description: "Combining front-end and back-end technologies"
  },
  {
    id: 34,
    title: "Deploying Your Web Application",
    category: "Databases & Full Stack",
    description: "Publishing web applications to production environments"
  },
  {
    id: 35,
    title: "Boss Level Challenge 4 - Blog Website Upgrade",
    category: "Databases & Full Stack",
    description: "Enhancing a blog with database functionality"
  },
  {
    id: 36,
    title: "Build Your Own RESTful API From Scratch",
    category: "Databases & Full Stack",
    description: "Creating a complete API with Node.js and databases"
  },
  {
    id: 37,
    title: "Authentication & Security",
    category: "Databases & Full Stack",
    description: "Implementing user authentication and security measures"
  },
  {
    id: 38,
    title: "React.js",
    category: "Advanced Topics",
    description: "Building user interfaces with React"
  },
  {
    id: 39,
    title: "Web3 Decentralised App (DApp) Development with the Internet Computer",
    category: "Advanced Topics",
    description: "Creating blockchain-based decentralized applications"
  },
  {
    id: 40,
    title: "Build Your First DeFi (Decentralised Finance) DApp - DBANK",
    category: "Advanced Topics",
    description: "Developing a decentralized finance application"
  },
  {
    id: 41,
    title: "Deploying to the ICP Live Blockchain",
    category: "Advanced Topics",
    description: "Publishing applications to the Internet Computer blockchain"
  },
  {
    id: 42,
    title: "Building DApps on ICP with a React Frontend",
    category: "Advanced Topics",
    description: "Combining React with blockchain backends"
  },
  {
    id: 43,
    title: "Create Your Own Crypto Token",
    category: "Advanced Topics",
    description: "Developing and deploying a cryptocurrency token"
  },
  {
    id: 44,
    title: "Minting NFTs and Building an NFT Marketplace like OpenSea",
    category: "Advanced Topics",
    description: "Creating and trading non-fungible tokens"
  },
  {
    id: 45,
    title: "Optional Module Ask Angela Anything",
    category: "Advanced Topics",
    description: "Q&A session covering various web development topics"
  },
  {
    id: 46,
    title: "Next Steps",
    category: "Advanced Topics",
    description: "Guidance for continuing your web development journey"
  }
];

const categories = [
  {
    name: "Front-End Fundamentals",
    modules: "1-13",
    color: "#4299e1", // blue
    percentage: 28
  },
  {
    name: "JavaScript & DOM",
    modules: "14-20",
    color: "#f6ad55", // orange
    percentage: 15
  },
  {
    name: "Backend Development",
    modules: "21-28",
    color: "#68d391", // green
    percentage: 17
  },
  {
    name: "Databases & Full Stack",
    modules: "29-37",
    color: "#fc8181", // red
    percentage: 20
  },
  {
    name: "Advanced Topics",
    modules: "38-46",
    color: "#b794f4", // purple
    percentage: 20
  }
];

export { courseModules, categories };