import logging
import json
import os
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, MessageHandler, filters, ContextTypes
import asyncio

# Enable logging
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
                    level=logging.INFO)
logger = logging.getLogger(__name__)

# Replace with your actual bot token
TOKEN = os.environ.get("BOT_TOKEN")

# Job data (in a real app, fetch from database)
JOBS = [
    {"id": 1, "title": "Junior Full Stack Developer", "company": "IceAddis Tech", "location": "Addis Ababa", "salary": "15k-22k ETB", "desc": "React + Node.js, fresh grads welcome"},
    {"id": 2, "title": "UI/UX Designer", "company": "Creative Hub Ethiopia", "location": "Remote", "salary": "12k-18k ETB", "desc": "Figma, portfolio building"},
    {"id": 3, "title": "AgriTech Officer", "company": "Green Ethiopia PLC", "location": "Hawassa", "salary": "10k-15k ETB", "desc": "Smart irrigation & extension services"},
    {"id": 4, "title": "Business Development Associate", "company": "Ethio Export Group", "location": "Addis", "salary": "14k-20k ETB", "desc": "Sales, partnership growth"},
]

COURSES = [
    {"name": "Full-Stack Web Dev", "description": "MERN stack + AI tools. Job guarantee."},
    {"name": "Digital Marketing", "description": "SEO, Social Media, E-commerce. Internships available."},
    {"name": "Smart Farming", "description": "Irrigation, drones, agribusiness. Direct hiring."},
    {"name": "Business Management", "description": "Project management, finance, leadership. Guaranteed interview."},
]

# User state storage (in-memory, reset on restart)
user_data = {}

# -------------------- Command Handlers --------------------

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a welcome message when /start is issued."""
    user = update.effective_user
    await update.message.reply_text(
        f"🇪🇹 Welcome to SkillSwap Ethiopia, {user.first_name}!\n\n"
        "I'm your AI assistant. I can help you find jobs, courses, and more.\n"
        "Use /help to see all commands.",
        reply_markup=main_menu_keyboard()
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Send a list of available commands."""
    help_text = (
        "📋 *SkillSwap Bot Commands*\n\n"
        "/start - Start the bot\n"
        "/help - Show this help\n"
        "/jobs - List current job openings\n"
        "/courses - Show available courses\n"
        "/skilltest - Take an AI skill test\n"
        "/offline - How to use offline mode\n"
        "/apply - Apply for a job or course\n"
        "/contact - Get support\n\n"
        "You can also use inline buttons below."
    )
    await update.message.reply_text(help_text, parse_mode='Markdown', reply_markup=main_menu_keyboard())

async def jobs_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show list of jobs."""
    await show_jobs(update, context, edit=False)

async def show_jobs(update: Update, context: ContextTypes.DEFAULT_TYPE, edit=False, page=0) -> None:
    """Display jobs with inline pagination."""
    jobs_per_page = 2
    total_pages = (len(JOBS) + jobs_per_page - 1) // jobs_per_page
    start_idx = page * jobs_per_page
    end_idx = min(start_idx + jobs_per_page, len(JOBS))
    jobs_to_show = JOBS[start_idx:end_idx]

    text = "🔥 *Current Job Openings*\n\n"
    for job in jobs_to_show:
        text += f"*{job['title']}* at {job['company']}\n📍 {job['location']} | 💰 {job['salary']}\n{job['desc']}\n\n"

    keyboard = []
    if total_pages > 1:
        nav_buttons = []
        if page > 0:
            nav_buttons.append(InlineKeyboardButton("◀️ Prev", callback_data=f"jobs_page_{page-1}"))
        if page < total_pages - 1:
            nav_buttons.append(InlineKeyboardButton("Next ▶️", callback_data=f"jobs_page_{page+1}"))
        if nav_buttons:
            keyboard.append(nav_buttons)
    keyboard.append([InlineKeyboardButton("Apply for a job", callback_data="apply_job")])
    keyboard.append([InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")])

    reply_markup = InlineKeyboardMarkup(keyboard)
    if edit:
        await update.callback_query.edit_message_text(text, parse_mode='Markdown', reply_markup=reply_markup)
    else:
        await update.message.reply_text(text, parse_mode='Markdown', reply_markup=reply_markup)

async def courses_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Show list of courses."""
    text = "📚 *Available Courses*\n\n"
    for course in COURSES:
        text += f"*{course['name']}*\n{course['description']}\n\n"
    text += "Select a course to learn more."
    keyboard = [[InlineKeyboardButton(c['name'], callback_data=f"course_{c['name'].replace(' ', '_')}")] for c in COURSES]
    keyboard.append([InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")])
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(text, parse_mode='Markdown', reply_markup=reply_markup)

async def skilltest_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Start the AI skill test."""
    text = (
        "🤖 *AI Skill Test*\n\n"
        "I'll ask you a few questions to match you with the best career path.\n"
        "Let's start!\n\n"
        "Question 1: Which field excites you most?"
    )
    keyboard = [
        [InlineKeyboardButton("💻 Coding & Tech", callback_data="skill_tech")],
        [InlineKeyboardButton("🎨 Design & Creativity", callback_data="skill_design")],
        [InlineKeyboardButton("🌾 Agriculture & Environment", callback_data="skill_agri")],
        [InlineKeyboardButton("📊 Business & Leadership", callback_data="skill_business")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(text, parse_mode='Markdown', reply_markup=reply_markup)

async def offline_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Explain offline access."""
    text = (
        "📱 *Offline Access*\n\n"
        "Even without internet, you can use SkillSwap via:\n\n"
        "• **SMS**: Send a text to **+251900818678** with keywords like JOBS, SKILLS, HELP\n"
        "• **Telegram Bot**: I'm always here! Send me a message (even offline).\n"
        "• **Phone Number**: Dial +251900818678 (coming soon)\n\n"
        "No data required. We'll reply instantly with job listings, course info, and more."
    )
    keyboard = [[InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(text, parse_mode='Markdown', reply_markup=reply_markup)

async def apply_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Guide user to apply."""
    text = (
        "📝 *Apply for Jobs/Courses*\n\n"
        "To apply, please visit our website or send your CV via Telegram:\n"
        "1. Go to our official bot: @SkillSwapEthiopiaBot\n"
        "2. Use the /apply command and follow instructions.\n\n"
        "Alternatively, you can send your resume to skillswapethiopia@gmail.com\n\n"
        "We'll get back to you within 48 hours."
    )
    keyboard = [[InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(text, parse_mode='Markdown', reply_markup=reply_markup)

async def contact_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Contact support."""
    text = (
        "📞 *Contact Support*\n\n"
        "Email: skillswapethiopia@gmail.com\n"
        "Phone: +251-900-818-678\n"
        "Telegram: @skillswapethiopia (coming soon)\n\n"
        "Our team is available 9AM-6PM, Monday-Friday."
    )
    keyboard = [[InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]]
    reply_markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text(text, parse_mode='Markdown', reply_markup=reply_markup)

# -------------------- Callback Query Handlers --------------------

async def button_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle inline button presses."""
    query = update.callback_query
    await query.answer()
    data = query.data

    if data == "main_menu":
        await query.edit_message_text(
            "🇪🇹 *SkillSwap Ethiopia Bot*\n\nWhat would you like to do?",
            parse_mode='Markdown',
            reply_markup=main_menu_keyboard()
        )

    elif data.startswith("jobs_page_"):
        page = int(data.split("_")[-1])
        await show_jobs(update, context, edit=True, page=page)

    elif data == "apply_job":
        text = (
            "To apply for a job, please send your CV and the job title to our Telegram group: @skillswapethiopia_group\n"
            "Or email to skillswapethiopia@gmail.com with the job title in subject."
        )
        keyboard = [[InlineKeyboardButton("🔙 Back to Jobs", callback_data="jobs")]]
        await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == "jobs":
        await show_jobs(update, context, edit=True)

    elif data.startswith("course_"):
        course_name = data.replace("course_", "").replace("_", " ")
        course = next((c for c in COURSES if c['name'] == course_name), None)
        if course:
            text = f"*{course['name']}*\n\n{course['description']}\n\nTo enroll, use /apply or visit our website."
        else:
            text = "Course not found."
        keyboard = [[InlineKeyboardButton("🔙 Back to Courses", callback_data="courses")]]
        await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    elif data == "courses":
        text = "📚 *Available Courses*\n\n"
        for c in COURSES:
            text += f"*{c['name']}*\n{c['description']}\n\n"
        keyboard = [[InlineKeyboardButton(c['name'], callback_data=f"course_{c['name'].replace(' ', '_')}")] for c in COURSES]
        keyboard.append([InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")])
        await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith("skill_"):
        # Handle skill test answer
        choice = data.split("_")[1]
        # Store user's interest
        user_id = update.effective_user.id
        if user_id not in user_data:
            user_data[user_id] = {}
        user_data[user_id]['interest'] = choice

        # Ask second question
        text = (
            "Great! Now, how do you prefer to work?\n\n"
            "Question 2: Choose your work style:"
        )
        keyboard = [
            [InlineKeyboardButton("🧠 Solo & deep focus", callback_data="work_solo")],
            [InlineKeyboardButton("🤝 Team collaboration", callback_data="work_team")],
            [InlineKeyboardButton("🏢 In a company/organization", callback_data="work_company")],
        ]
        await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    elif data.startswith("work_"):
        work_style = data.split("_")[1]
        user_id = update.effective_user.id
        if user_id not in user_data:
            user_data[user_id] = {}
        user_data[user_id]['work_style'] = work_style

        interest = user_data[user_id].get('interest')
        # Generate career recommendation based on interest
        if interest == "tech":
            recommendation = "Software Developer, IT Support, Data Analyst"
            course = "Full-Stack Web Dev"
        elif interest == "design":
            recommendation = "UI/UX Designer, Graphic Artist"
            course = "Digital Marketing or Graphic Design"
        elif interest == "agri":
            recommendation = "Agronomist, Farm Manager"
            course = "Smart Farming & Agri-tech"
        elif interest == "business":
            recommendation = "Business Analyst, Project Manager"
            course = "Business Management"
        else:
            recommendation = "Explore various fields"
            course = "General Skills"

        text = (
            f"✅ *Your AI Career Match*\n\n"
            f"Based on your answers, you'd be a great fit for roles like:\n"
            f"*{recommendation}*\n\n"
            f"Recommended Course: *{course}*\n\n"
            f"To get started, visit our website or use /courses to explore."
        )
        keyboard = [[InlineKeyboardButton("🔙 Main Menu", callback_data="main_menu")]]
        await query.edit_message_text(text, parse_mode='Markdown', reply_markup=InlineKeyboardMarkup(keyboard))

    else:
        # Fallback
        await query.edit_message_text("Sorry, I didn't understand that. Please use the menu buttons.")

# -------------------- Helper Functions --------------------

def main_menu_keyboard() -> InlineKeyboardMarkup:
    """Create main menu keyboard."""
    keyboard = [
        [InlineKeyboardButton("💼 Jobs", callback_data="jobs"),
         InlineKeyboardButton("📚 Courses", callback_data="courses")],
        [InlineKeyboardButton("🤖 AI Skill Test", callback_data="skilltest"),
         InlineKeyboardButton("📱 Offline Mode", callback_data="offline")],
        [InlineKeyboardButton("📝 Apply", callback_data="apply"),
         InlineKeyboardButton("📞 Contact", callback_data="contact")],
    ]
    return InlineKeyboardMarkup(keyboard)

async def skilltest_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle the skilltest menu button."""
    query = update.callback_query
    await query.answer()
    await skilltest_command(query, context)

async def offline_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle offline menu button."""
    query = update.callback_query
    await query.answer()
    await offline_command(query, context)

async def apply_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle apply menu button."""
    query = update.callback_query
    await query.answer()
    await apply_command(query, context)

async def contact_callback(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle contact menu button."""
    query = update.callback_query
    await query.answer()
    await contact_command(query, context)

async def text_message(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle regular text messages (fallback)."""
    text = update.message.text.lower()
    if "job" in text:
        await jobs_command(update, context)
    elif "course" in text:
        await courses_command(update, context)
    elif "skill" in text or "test" in text:
        await skilltest_command(update, context)
    elif "offline" in text:
        await offline_command(update, context)
    elif "apply" in text:
        await apply_command(update, context)
    elif "help" in text:
        await help_command(update, context)
    else:
        await update.message.reply_text(
            "I'm here to help with jobs, courses, and career advice. Try /help to see available commands.",
            reply_markup=main_menu_keyboard()
        )

# -------------------- Main --------------------

def main() -> None:
    """Start the bot."""
    # Create the Application
    application = Application.builder().token(TOKEN).build()

    # Register command handlers
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("jobs", jobs_command))
    application.add_handler(CommandHandler("courses", courses_command))
    application.add_handler(CommandHandler("skilltest", skilltest_command))
    application.add_handler(CommandHandler("offline", offline_command))
    application.add_handler(CommandHandler("apply", apply_command))
    application.add_handler(CommandHandler("contact", contact_command))

    # Register callback query handlers
    application.add_handler(CallbackQueryHandler(button_callback, pattern="^(main_menu|jobs_page_|apply_job|jobs|courses|course_|skill_|work_)"))

    # Handle menu buttons via callback queries (these are not commands)
    application.add_handler(CallbackQueryHandler(skilltest_callback, pattern="^skilltest$"))
    application.add_handler(CallbackQueryHandler(offline_callback, pattern="^offline$"))
    application.add_handler(CallbackQueryHandler(apply_callback, pattern="^apply$"))
    application.add_handler(CallbackQueryHandler(contact_callback, pattern="^contact$"))

    # Fallback for regular messages
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, text_message))

    # Run the bot (polling)
    application.run_polling()

if __name__ == '__main__':
    main()
