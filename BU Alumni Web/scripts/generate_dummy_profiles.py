
import requests
import uuid
import random
from datetime import datetime, timedelta
import json

# Supabase configuration
SUPABASE_URL = "https://lalddttyizimgsmnhuet.supabase.co"
ANON_KEY = "sb_publishable_IIlQXjQuaNiNKaBTaAp0FQ_XcG0bsX6"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbGRkdHR5aXppbWdzbW5odWV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxNzQ0MywiZXhwIjoyMDkzMTkzNDQzfQ.UDNR-UJGp2sJzsW7QHhU_R-HyccWhniCCuD3EVt2XBQ"

# Filipino names for realistic dummy data
FIRST_NAMES = [
    "Juan", "Maria", "Jose", "Ana", "Pedro", "Carmen", "Miguel", "Rosa", "Antonio", "Teresa",
    "Francisco", "Elena", "Manuel", "Gloria", "Carlos", "Lourdes", "Fernando", "Nenita", "Ricardo", "Socorro",
    "Eduardo", "Remedios", "Roberto", "Concepcion", "Alberto", "Purificacion", "Ramon", "Mercedes", "Arturo", "Cecilia",
    "Raul", "Aurora", "Sergio", "Victoria", "Hector", "Luzviminda", "Marcelo", "Esperanza", "Alfredo", "Patrocinio",
    "Rodrigo", "Adelaida", "Victor", "Milagros", "Ernesto", "Consuelo", "Gabriel", "Pilar", "Julio", "Asuncion",
    "Jaime", "Dolores", "Marcos", "Caridad", "Enrique", "Rosario", "Andres", "Trinidad", "Domingo", "Nieves",
    "Salvador", "Inmaculada", "Ignacio", "Encarnacion", "Felipe", "Araceli", "Julian", "Belen", "Agustin", "Candelaria",
    "Martin", "Montserrat", "Ismael", "Carmelita", "Cesar", "Angela", "German", "Margarita", "Lucas", "Ines",
    "Joel", "Estrella", "Christian", "Marilou", "Arnel", "Jennifer", "Dennis", "Michelle", "Ryan", "Charmaine",
    "Mark", "Janice", "John", "Maricel", "Michael", "Rowena", "James", "Geraldine", "Paul", "Marites"
]

LAST_NAMES = [
    "Dela Cruz", "Santos", "Reyes", "Garcia", "Mendoza", "Torres", "Flores", "Dizon", "Cruz", "Bautista",
    "Ramos", "Aquino", "Castro", "Navarro", "Agustin", "Villanueva", "Fernandez", "Romero", "Valdez", "Salazar",
    "Pascual", "Lim", "Morales", "Marquez", "Santiago", "Rivera", "Perez", "Domingo", "Gonzalez", "Lopez",
    "Martinez", "Rodriguez", "Hernandez", "Silva", "Alvarez", "Medina", "Guerrero", "Estrada", "Vargas", "Cortez",
    "Del Rosario", "Bautista", "Castillo", "Vega", "Fuentes", "Camacho", "Briones", "Ocampo", "Miranda", "Peralta",
    "Soriano", "Del Valle", "Cabrera", "De Leon", "Sison", "Diaz", "Padilla", "Lorenzo", "Mercado", "Villamor",
    "Ignacio", "De Guzman", "De Vera", "David", "Enriquez", "Ilagan", "Jacinto", "Javier", "Lazaro", "Macapagal",
    "Magno", "Manalo", "Natividad", "Ortega", "Palma", "Quinto", "Razon", "Sarmiento", "Tiangco", "Umali",
    "Valencia", "Yabut", "Zamora", "Abad", "Bondoc", "Caguete", "Dagohoy", "Escobar", "Fajardo", "Guevarra"
]

COLLEGES = [
    "College of Liberal Arts and General Education (CLAGE)",
    "College of Business Administration and Accountancy (CBAA)",
    "College of Education and Human Development (CEHD)",
    "College of Environmental Design and Engineering (CEDE)",
    "College of Nursing and Allied Health Sciences (CNAHS)",
    "College of Information Technology Education (CITE)",
    "College of Hospitality Management and Tourism (CHMT)",
    "School of Graduate Studies"
]

COURSES_BY_COLLEGE = {
    "College of Liberal Arts and General Education (CLAGE)": [
        "Bachelor of Arts in Communication",
        "Bachelor of Arts in Political Science"
    ],
    "College of Business Administration and Accountancy (CBAA)": [
        "Bachelor of Science in Accountancy",
        "Bachelor of Science in Management Accounting",
        "Bachelor of Science in Business Administration"
    ],
    "College of Education and Human Development (CEHD)": [
        "Bachelor of Early Childhood Education",
        "Bachelor of Elementary Education",
        "Bachelor of Secondary Education",
        "Bachelor of Physical Education",
        "Bachelor of Science in Psychology"
    ],
    "College of Environmental Design and Engineering (CEDE)": [
        "Bachelor of Science in Civil Engineering",
        "Bachelor of Science in Computer Engineering",
        "Bachelor of Science in Electrical Engineering",
        "Bachelor of Science in Electronics Engineering"
    ],
    "College of Nursing and Allied Health Sciences (CNAHS)": [
        "Bachelor of Science in Nursing",
        "Bachelor of Science in Nutrition and Dietetics",
        "Bachelor of Science in Medical Technology/Medical Laboratory Science"
    ],
    "College of Information Technology Education (CITE)": [
        "Bachelor of Science in Computer Science",
        "Bachelor of Science in Information Technology"
    ],
    "College of Hospitality Management and Tourism (CHMT)": [
        "Bachelor of Science in Hospitality Management",
        "Bachelor of Science in Tourism Management"
    ],
    "School of Graduate Studies": [
        "Master in Business Administration",
        "Master in Public Administration",
        "Master of Arts in Education",
        "Doctor of Education"
    ]
}

BATCH_YEARS = list(range(1990, 2026))

def generate_random_date(start_year=2020, end_year=2025):
    """Generate a random created_at date"""
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    random_days = random.randint(0, delta.days)
    return (start + timedelta(days=random_days)).isoformat()

def generate_dummy_profile(index):
    """Generate a single dummy profile"""
    first_name = random.choice(FIRST_NAMES)
    middle_name = random.choice(FIRST_NAMES) if random.random() > 0.3 else None
    last_name = random.choice(LAST_NAMES)
    full_name = f"{first_name} {middle_name + ' ' if middle_name else ''}{last_name}"
    
    college = random.choice(COLLEGES)
    degree = random.choice(COURSES_BY_COLLEGE[college])
    batch_year = random.choice(BATCH_YEARS)
    
    # Create a unique UUID for the profile
    user_id = str(uuid.uuid4())
    
    # Random created_at date (some recent, some older)
    created_at = generate_random_date(
        start_year=random.choice([2020, 2021, 2022, 2023, 2024]),
        end_year=2025
    )
    
    profile = {
        "id": user_id,
        "first_name": first_name,
        "middle_name": middle_name,
        "last_name": last_name,
        "avatar_url": None,
        "role": random.choice(["alumni", "alumni", "alumni", "alumni", "moderator"]),
        "bio": None,
        "batch_year": batch_year,
        "degree": degree,
        "college": college,
        "is_verified": random.choice([True, True, True, False]),
        "created_at": created_at,
        "updated_at": created_at
    }
    
    return profile

def create_auth_user(email, password, user_data):
    """Create a user in Supabase Auth using admin API"""
    headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    payload = {
        "email": email,
        "password": password,
        "email_confirm": True,  # Auto-confirm email
        "user_metadata": user_data
    }
    
    response = requests.post(url, headers=headers, json=payload)
    return response

def insert_profiles():
    """Insert 100 dummy profiles into Supabase"""
    profiles = [generate_dummy_profile(i) for i in range(100)]
    
    # Headers for database API
    db_headers = {
        "apikey": ANON_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
    }
    
    db_url = f"{SUPABASE_URL}/rest/v1/profiles"
    
    total_inserted = 0
    total_users_created = 0
    
    for i, profile in enumerate(profiles):
        # Step 1: Create auth user
        email = f"dummy.alumni{i+1}@bualumni.test"
        password = "DummyPass123!"
        user_data = {
            "first_name": profile["first_name"],
            "last_name": profile["last_name"]
        }
        
        auth_response = create_auth_user(email, password, user_data)
        
        if auth_response.status_code in [200, 201]:
            total_users_created += 1
            user_id = auth_response.json().get("id")
            
            # Step 2: Update profile with the real user ID and additional data
            profile["id"] = user_id
            
            # Insert profile
            profile_response = requests.post(db_url, headers=db_headers, json=profile)
            
            if profile_response.status_code in [200, 201]:
                total_inserted += 1
                print(f"[{i+1}/100] Created user + profile: {profile['first_name']} {profile['last_name']}")
            else:
                print(f"[{i+1}/100] User created but profile insert failed: {profile_response.status_code} - {profile_response.text}")
        else:
            print(f"[{i+1}/100] Auth user creation failed: {auth_response.status_code} - {auth_response.text}")
    
    print(f"\n{'='*50}")
    print(f"Total auth users created: {total_users_created}")
    print(f"Total profiles inserted: {total_inserted}")
    print(f"{'='*50}")
    return profiles

if __name__ == "__main__":
    print("Generating 100 dummy alumni profiles...")
    profiles = insert_profiles()
    print(f"\nSample profile:")
    print(json.dumps(profiles[0], indent=2))
