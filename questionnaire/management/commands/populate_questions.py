import json
from django.core.management.base import BaseCommand
from questionnaire.models import Question, Choice
from django.db import connection

class Command(BaseCommand):
    help = 'Populates the database with the initial set of questionnaire questions and choices.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate questions...'))
        
        # Clear existing questions to avoid duplicates
        Question.objects.all().delete()

        # For PostgreSQL, reset the primary key sequence.
        # The sequence name is typically <table>_<column>_seq.
        with connection.cursor() as cursor:
            self.stdout.write(self.style.WARNING('Resetting question ID sequence for PostgreSQL...'))
            cursor.execute("ALTER SEQUENCE questionnaire_question_id_seq RESTART WITH 1")
            self.stdout.write(self.style.SUCCESS('Sequence reset.'))

        questionnaire_data = [
            # Personal Info
            {
                "order": 1, "group": "Personal Information", "text": "What is your name?", 
                "type": "TX", "choices": []
            },
            {
                "order": 2, "group": "Personal Information", "text": "What is your age?", 
                "type": "NU", "choices": []
            },
            {
                "order": 3, "group": "Personal Information", "text": "What is your gender?", 
                "type": "SC", "choices": ["Male", "Female", "Other", "Prefer not to say"]
            },
            {
                "order": 4, "group": "Personal Information", "text": "What is your marital status?", 
                "type": "SC", "choices": ["Single", "Married", "Divorced", "Widowed"]
            },
            {
                "order": 5, "group": "Personal Information", "text": "Do you have kids?", 
                "type": "SC", "choices": ["Yes", "No"]
            },
            # Income
            {
                "order": 6, "group": "Income & Job", "text": "What's your monthly income in hand?",
                "type": "NU", "custom_input_prompt": "Enter amount in ₹", "choices": []
            },
            {
                "order": 7, "group": "Income & Job", "text": "How stable is your job?",
                "type": "SC", "choices": [
                    "Permanent job (Very stable)", "Contract/Freelance (Somewhat stable)",
                    "Business owner (Variable income)", "Student with part-time work"
                ]
            },
            # Spending
            {
                "order": 8, "group": "Spending Habits", "text": "Where does most of your money go every month? (Select top 3)",
                "type": "MC", "choices": [
                    "Rent/EMI", "Food & Groceries", "Transportation", "Entertainment & Shopping",
                    "Family support", "Loan repayments", "Savings & Investments", "Bills (electricity, phone, etc.)"
                ],
                "custom_input_prompt": "If Rent/EMI, enter amount",
            },
            # Debt
            {
                "order": 9, "group": "Debt Situation", "text": "Do you currently have any loans or debts?",
                "type": "SC", "choices": [
                    "No debts (All clear! 🎉)", "Credit card debt", "Personal loan",
                    "Home loan/Rent advance", "Education loan", "Family/Friends loan", "Multiple debts"
                ]
            },
            {
                "order": 10, "group": "Debt Situation", "text": "If you have debts, what is your total monthly EMI amount?",
                "type": "SC", "choices": [
                    "Less than ₹10,000", "₹10,000 - ₹25,000", "₹25,000 - ₹50,000", "More than ₹50,000"
                ]
            },
            # Savings
            {
                "order": 11, "group": "Savings & Emergency Fund", "text": "If you lost your income today, how long could you survive on your savings?",
                "type": "SC", "choices": [
                    "Less than 1 month 😰", "1-3 months 😐", "3-6 months 😊",
                    "6-12 months 🎯", "More than 1 year 🚀", "What's an emergency fund? 🤔"
                ]
            },
            # Goals
            {
                "order": 12, "group": "Financial Goals", "text": "What's your biggest short-term (1-2 years) money goal right now?",
                "type": "SC", "choices": [
                    "Buy a smartphone/laptop", "Plan a vacation", "Build emergency fund",
                    "Pay off debts", "Start investing"
                ]
            },
            {
                "order": 13, "group": "Financial Goals", "text": "What's your biggest long-term (5+ years) money goal right now?",
                "type": "SC", "choices": [
                    "Buy a house", "Children's education", "Retirement planning",
                    "Start a business", "Financial independence"
                ]
            },
            # Dependents
            {
                "order": 14, "group": "Financial Dependents", "text": "Who depends on your income?",
                "type": "MC", "choices": [
                    "Just myself", "Spouse/Partner", "Parents (monthly support)",
                    "Children", "Siblings' education", "Extended family"
                ]
            },
            {
                "order": 15, "group": "Financial Dependents", "text": "What is your monthly family support amount?",
                "type": "SC", "choices": [
                    "No support needed", "₹5,000 - ₹15,000", "₹15,000 - ₹30,000", "₹30,000+"
                ]
            },
            # Investments
            {
                "order": 16, "group": "Investments", "text": "Describe your current investments.",
                "type": "TX", "custom_input_prompt": "Where, how, and when do you invest?", "choices": []
            },
            # Personality
            {
                "order": 17, "group": "Financial Personality", "text": "Which statement describes your spending style best?",
                "type": "SC", "choices": [
                    "\"Save first, spend later\" 💰", "\"Live for today, save tomorrow\" 🎉",
                    "\"Balanced - 50% save, 50% enjoy\" ⚖️", "\"Money comes and goes\" 🌊",
                    "\"Every rupee counts\" 🔍"
                ]
            },
            {
                "order": 18, "group": "Financial Personality", "text": "How would you describe your comfort with investing?",
                "type": "SC", "choices": [
                    "Traditional savings only (FD, Savings account)", "Ready to try mutual funds",
                    "Interested in stocks", "Crypto curious", "Real estate focused", "Gold lover"
                ]
            }
        ]

        for q_data in questionnaire_data:
            question = Question.objects.create(
                order=q_data['order'],
                text=q_data['text'],
                question_type=q_data['type'],
                group=q_data['group'],
                custom_input_prompt=q_data.get('custom_input_prompt')
            )
            for choice_order, choice_text in enumerate(q_data.get('choices', [])):
                Choice.objects.create(
                    question=question,
                    text=choice_text,
                    order=choice_order
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully populated {len(questionnaire_data)} questions.')) 