const { sequelize } = require('../config/database');
const { Category, Course, Section, Lesson, User, CourseTag } = require('../models');

const seedCourses = async () => {
  try {
    console.log('🔄 Starting course data seeding...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection successful');

    // Find or create an instructor user
    const instructor = await User.findOne({ where: { role_id: (await sequelize.query('SELECT id FROM roles WHERE name = :name LIMIT 1', { replacements: { name: 'instructor' } }))[0][0].id } });
    
    if (!instructor) {
      console.log('⚠️  No instructor user found. Please create an instructor user first.');
      process.exit(1);
    }

    // Create categories
    const categories = [
      { name: 'Business', slug: 'business', description: 'Business and entrepreneurship courses', icon_url: '💼', display_order: 1 },
      { name: 'Technology', slug: 'technology', description: 'Technology and programming courses', icon_url: '💻', display_order: 2 },
      { name: 'Design', slug: 'design', description: 'Design and creative courses', icon_url: '🎨', display_order: 3 },
      { name: 'Development', slug: 'development', description: 'Software development courses', icon_url: '👨‍💻', display_order: 4 },
      { name: 'Marketing', slug: 'marketing', description: 'Digital marketing courses', icon_url: '📈', display_order: 5 }
    ];

    for (const categoryData of categories) {
      const [category, created] = await Category.findOrCreate({
        where: { slug: categoryData.slug },
        defaults: categoryData
      });
      
      if (created) {
        console.log(`✅ Created category: ${categoryData.name}`);
      } else {
        console.log(`ℹ️  Category already exists: ${categoryData.name}`);
      }
    }

    // Create sample courses
    const techCategory = await Category.findOne({ where: { slug: 'technology' } });
    const businessCategory = await Category.findOne({ where: { slug: 'business' } });
    const designCategory = await Category.findOne({ where: { slug: 'design' } });

    const courses = [
      {
        title: 'Introduction to JavaScript',
        slug: 'introduction-to-javascript',
        description: 'Learn the fundamentals of JavaScript programming language',
        content: 'This course covers JavaScript basics including variables, functions, objects, and DOM manipulation.',
        category_id: techCategory.id,
        instructor_id: instructor.id,
        status: 'published',
        difficulty_level: 'beginner',
        estimated_hours: 10.5,
        price: 0.00,
        tags: ['javascript', 'programming', 'web development'],
        created_by: instructor.id,
        updated_by: instructor.id
      },
      {
        title: 'Advanced React Patterns',
        slug: 'advanced-react-patterns',
        description: 'Master advanced React patterns and best practices',
        content: 'Learn advanced React concepts including hooks, context, performance optimization, and state management.',
        category_id: techCategory.id,
        instructor_id: instructor.id,
        status: 'published',
        difficulty_level: 'advanced',
        estimated_hours: 15.0,
        price: 49.99,
        tags: ['react', 'frontend', 'javascript'],
        created_by: instructor.id,
        updated_by: instructor.id
      },
      {
        title: 'Digital Marketing Fundamentals',
        slug: 'digital-marketing-fundamentals',
        description: 'Learn the basics of digital marketing',
        content: 'This course covers SEO, social media marketing, email marketing, and content marketing strategies.',
        category_id: businessCategory.id,
        instructor_id: instructor.id,
        status: 'published',
        difficulty_level: 'beginner',
        estimated_hours: 8.0,
        price: 29.99,
        tags: ['marketing', 'business', 'seo'],
        created_by: instructor.id,
        updated_by: instructor.id
      }
    ];

    for (const courseData of courses) {
      const [course, created] = await Course.findOrCreate({
        where: { slug: courseData.slug },
        defaults: courseData
      });
      
      if (created) {
        console.log(`✅ Created course: ${courseData.title}`);
        
        // Create sections and lessons for the course
        const sections = [
          {
            title: 'Introduction',
            description: 'Course introduction and setup',
            display_order: 1
          },
          {
            title: 'Core Concepts',
            description: 'Main course content',
            display_order: 2
          },
          {
            title: 'Advanced Topics',
            description: 'Advanced topics and best practices',
            display_order: 3
          }
        ];

        for (const sectionData of sections) {
          const section = await Section.create({
            course_id: course.id,
            title: sectionData.title,
            description: sectionData.description,
            display_order: sectionData.display_order
          });
          
          console.log(`  ✅ Created section: ${sectionData.title}`);
          
          // Create lessons for each section
          const lessons = [
            {
              title: 'Welcome to the course',
              description: 'Course overview and what you will learn',
              content: 'Welcome to the course! In this lesson, we will cover...',
              lesson_type: 'text',
              markdown_content: '# Welcome to the course\n\nThis is the first lesson where we introduce the course topics.',
              display_order: 1,
              duration_minutes: 5,
              is_published: true
            },
            {
              title: 'Getting started',
              description: 'Setting up your environment',
              content: 'In this lesson, we will set up the development environment.',
              lesson_type: 'text',
              markdown_content: '# Getting Started\n\nFollow these steps to set up your environment...',
              display_order: 2,
              duration_minutes: 10,
              is_published: true
            }
          ];

          for (const lessonData of lessons) {
            await Lesson.create({
              section_id: section.id,
              title: lessonData.title,
              description: lessonData.description,
              content: lessonData.content,
              lesson_type: lessonData.lesson_type,
              markdown_content: lessonData.markdown_content,
              display_order: lessonData.display_order,
              duration_minutes: lessonData.duration_minutes,
              is_published: lessonData.is_published
            });
            
            console.log(`    ✅ Created lesson: ${lessonData.title}`);
          }
        }
      } else {
        console.log(`ℹ️  Course already exists: ${courseData.title}`);
      }
    }

    console.log('✅ Course data seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Course seeding failed:', error);
    process.exit(1);
  }
};

seedCourses();