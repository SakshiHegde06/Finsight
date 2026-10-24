"""
FinSight Training Dataset based on user transaction text patterns.
Categories:
- travel (Uber, Ola, Flight booking, Train ticket IRCTC, Bus ticket, Hotel booking)
- shopping (Amazon, Flipkart, Online shopping, Electronics shopping, Clothing store)
- emi (Home loan EMI, Car loan EMI, Bike loan EMI, Personal loan installment, Credit card EMI)
- entertainment (Netflix subscription, Movie ticket booking, Game purchase, Concert ticket)
- healthcare (Hospital bill, Doctor consultation, Medical test charges, Pharmacy medicine)
- investment (Crypto investment, PPF contribution, Mutual fund SIP, Stock purchase, Fixed deposit)
- utilities (Electricity bill payment, Mobile recharge, Gas bill payment, Water bill, Internet recharge)
- food (Zomato dinner, Swiggy order, Restaurant bill, Food court payment, Lunch at hotel, Cafe coffee, Pizza delivery)
- education (College fees payment, Exam fee, Online course subscription, Library fee)
"""

DATASET_TEMPLATES = {
    "healthcare": [
        "Fever consultation", "Fever medicine purchase", "Paracetamol tablets", "Dolo 650 strips", 
        "Cough syrup", "Cold and flu medicine", "Headache pain relief", "Antibiotics prescription",
        "Hospital bill", "Doctor consultation fee", "Clinic visit charge", "General physician appointment",
        "Medical test charges", "Pharmacy medicine purchase", "Dental clinic checkup", "Diagnostic lab blood test",
        "X-Ray chest scan", "MRI scan charges", "Ultrasound scan", "Full body health checkup",
        "Apollo Pharmacy purchase", "MedPlus medicine order", "Tata 1mg prescription delivery", "PharmEasy order",
        "Netmeds healthcare order", "Dentist tooth extraction", "Eye clinic consultation optometrist",
        "Pediatrician child consultation", "Orthopedic consultation", "Dermatologist skin checkup",
        "Physiotherapy rehabilitation session", "Health insurance mediclaim premium", "Ambulance emergency fee",
        "Surgical dressing", "Ayurvedic clinic medicine", "Homeopathy consultation", "Vitamins and supplements"
    ],
    "travel": [
        "Uber ride", "Ola cab", "Rapido bike taxi", "Auto rickshaw ride",
        "Flight ticket booking", "IndiGo air ticket", "Air India flight booking",
        "Train ticket IRCTC", "Bus ticket redBus", "Hotel booking MakeMyTrip", 
        "Airport taxi transfer", "Metro rail pass recharge", "Car rental self-drive",
        "Petrol pump fuel filling", "Diesel fuel Indian Oil", "Shell petrol bunk", 
        "FASTag highway toll recharge", "Airport parking fee", "Railway station parking"
    ],
    "food": [
        "Pizza delivery Domino's", "Lunch at restaurant", "Food court payment", 
        "Zomato dinner order", "Swiggy food delivery", "Restaurant bill dinner", "Cafe coffee artisan espresso",
        "Starbucks coffee and snack", "Bakery bread and cakes", "Chai point tea snacks", 
        "Burger King combo meal", "McDonalds lunch order", "Biryani family dinner",
        "Blinkit grocery delivery", "Zepto quick grocery", "Instamart fresh vegetables and fruits", 
        "BigBasket monthly grocery", "Supermarket store purchase", "Milk dairy morning delivery"
    ],
    "shopping": [
        "Flipkart order electronics", "Amazon purchase household", "Electronics shopping gadgets", 
        "Clothing store bill Zara", "Online shopping payment Myntra", "Retail store checkout Ajio", 
        "H&M apparel store", "Decathlon sports gear", "Nykaa cosmetics beauty", 
        "Croma electronics appliances", "Reliance Digital purchase", "IKEA furniture home decor",
        "Footwear shoes Nike store", "Watches showroom Titan", "Baggage and luggage store"
    ],
    "emi": [
        "Home loan EMI HDFC Bank", "Car loan EMI ICICI Bank", "Bike loan EMI Axis Bank", 
        "Personal loan installment SBI", "Credit card monthly EMI", "Education loan installment Canara Bank",
        "Bajaj Finserv consumer EMI", "Kotak loan monthly deduction", "Property mortgage payment"
    ],
    "entertainment": [
        "Netflix monthly subscription", "Movie ticket booking PVR Cinemas", "Game purchase PlayStation Store", 
        "Concert ticket live show", "Steam PC video game purchase", "Spotify Premium family plan",
        "Disney+ Hotstar annual VIP", "YouTube Premium subscription", "BookMyShow theatre booking",
        "Gaming zone arcade arcade", "Amusement park entry ticket", "Music festival pass"
    ],
    "investment": [
        "Crypto investment Bitcoin", "PPF contribution public provident fund", "Mutual fund SIP Zerodha Coin", 
        "Stock purchase Groww equities", "Fixed deposit investment SBI", "Sovereign Gold Bond purchase", 
        "Index fund deposit Nifty 50", "NPS retirement account contribution", "Demat account AMC fee"
    ],
    "utilities": [
        "Electricity bill payment BESCOM", "Mobile recharge prepaid Airtel", "Gas bill payment Adani PNG", 
        "Water bill municipal authority", "Internet broadband wifi bill ACT Fibernet", "Jio fiber payment", 
        "Tata Play DTH recharge", "Apartment society maintenance maintenance bill", "LPG cooking cylinder refill"
    ],
    "education": [
        "College fees payment semester", "Exam fee university registration", "Online course subscription Coursera", 
        "Library fee annual membership", "University tuition fee installment", "Certification course Udemy",
        "School admission fees", "Coaching institute test series", "Textbooks and academic stationery"
    ]
}

def generate_training_data():
    samples = []
    import random
    random.seed(42)
    
    amounts = [150, 499, 1200, 2500, 4850, 8900, 12500, 24000, 36000, 48500]
    
    for category, templates in DATASET_TEMPLATES.items():
        for tmpl in templates:
            for _ in range(8):
                amt = random.choice(amounts)
                tx_id = f"TXN{random.randint(10000000, 99999999):x}"
                # Full pattern
                samples.append((f"{tmpl} INR {amt} {tx_id}", category))
                # Text only
                samples.append((tmpl, category))
                # Description with merchant/keywords
                samples.append((f"{tmpl} payment", category))
                samples.append((f"Paid for {tmpl}", category))
                samples.append((f"{tmpl} debit {amt}", category))
    return samples

TRAINING_DATA = generate_training_data()
