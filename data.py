"""
Seeded gig worker profiles for ShadowCredit demo.
Each profile represents a realistic gig economy worker.
"""

WORKERS = [
    {
        "id": 1,
        "name": "Ravi Kumar",
        "avatar": "RK",
        "job_type": "Delivery Rider",
        "platform": "Swiggy / Zomato",
        "city": "Bengaluru",
        "monthly_incomes": [18000, 21000, 19500, 22000, 20000, 23500, 21000, 24000, 22500, 25000, 23000, 26000],
        "completed_jobs": 1240,
        "cancellations": 48,
        "rating": 4.6,
        "months_active": 18,
        "account_age_months": 20,
        "income_sources": 2,
        "active_months_last_year": 11,
        "phone": "+91-9876543210",
        "email": "ravi.kumar@example.com"
    },
    {
        "id": 2,
        "name": "Priya Singh",
        "avatar": "PS",
        "job_type": "Cab Driver",
        "platform": "Ola / Uber",
        "city": "Mumbai",
        "monthly_incomes": [28000, 25000, 30000, 22000, 29000, 27000, 31000, 26000, 32000, 29000, 33000, 30000],
        "completed_jobs": 2100,
        "cancellations": 210,
        "rating": 4.3,
        "months_active": 24,
        "account_age_months": 28,
        "income_sources": 2,
        "active_months_last_year": 12,
        "phone": "+91-9876500001",
        "email": "priya.singh@example.com"
    },
    {
        "id": 3,
        "name": "Amit Verma",
        "avatar": "AV",
        "job_type": "Freelancer",
        "platform": "Upwork / Fiverr",
        "city": "Delhi",
        "monthly_incomes": [45000, 12000, 60000, 8000, 55000, 20000, 70000, 15000, 65000, 30000, 80000, 40000],
        "completed_jobs": 340,
        "cancellations": 22,
        "rating": 4.8,
        "months_active": 30,
        "account_age_months": 36,
        "income_sources": 3,
        "active_months_last_year": 9,
        "phone": "+91-9876500002",
        "email": "amit.verma@example.com"
    },
    {
        "id": 4,
        "name": "Sunita Nair",
        "avatar": "SN",
        "job_type": "Home Services",
        "platform": "Urban Company",
        "city": "Chennai",
        "monthly_incomes": [12000, 13500, 11000, 14000, 12500, 13000, 14500, 12000, 15000, 13500, 14000, 15500],
        "completed_jobs": 580,
        "cancellations": 15,
        "rating": 4.9,
        "months_active": 22,
        "account_age_months": 24,
        "income_sources": 1,
        "active_months_last_year": 12,
        "phone": "+91-9876500003",
        "email": "sunita.nair@example.com"
    },
    {
        "id": 5,
        "name": "Karan Mehta",
        "avatar": "KM",
        "job_type": "Multi-platform Gig",
        "platform": "Rapido / Dunzo / Swiggy",
        "city": "Hyderabad",
        "monthly_incomes": [9000, 7500, 11000, 6000, 8000, 5000, 9500, 7000, 10000, 6500, 8500, 7000],
        "completed_jobs": 920,
        "cancellations": 185,
        "rating": 3.8,
        "months_active": 14,
        "account_age_months": 18,
        "income_sources": 3,
        "active_months_last_year": 8,
        "phone": "+91-9876500004",
        "email": "karan.mehta@example.com"
    }
]

def get_all_workers():
    return WORKERS

def get_worker_by_id(worker_id: int):
    for w in WORKERS:
        if w["id"] == worker_id:
            return w
    return None
