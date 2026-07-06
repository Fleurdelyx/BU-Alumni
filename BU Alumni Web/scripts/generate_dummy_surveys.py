import requests
import uuid
import random
from datetime import datetime, timedelta

# Supabase configuration
SUPABASE_URL = "https://lalddttyizimgsmnhuet.supabase.co"
ANON_KEY = "sb_publishable_IIlQXjQuaNiNKaBTaAp0FQ_XcG0bsX6"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhbGRkdHR5aXppbWdzbW5odWV0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzYxNzQ0MywiZXhwIjoyMDkzMTkzNDQzfQ.UDNR-UJGp2sJzsW7QHhU_R-HyccWhniCCuD3EVt2XBQ"

HEADERS = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates",
}

PHILIPPINE_PROVINCES = [
    "Bulacan", "Pampanga", "Nueva Ecija", "Tarlac", "Bataan", "Zambales",
    "Metro Manila", "Cavite", "Laguna", "Batangas", "Rizal", "Quezon",
    "Pangasinan", "La Union", "Benguet", "Isabela", "Cagayan", "Ilocos Norte",
    "Ilocos Sur", "Cebu", "Bohol", "Negros Oriental", "Leyte", "Iloilo",
    "Davao del Sur", "Davao del Norte", "Cotabato", "South Cotabato", "Bukidnon",
    "Misamis Oriental", "Zamboanga del Sur", "Lanao del Norte", "Maguindanao"
]

REGIONS = [
    "Ilocos Region", "Cagayan Valley", "Central Luzon", "CALABARZON", "MIMAROPA",
    "Bicol Region", "Western Visayas", "Central Visayas", "Eastern Visayas",
    "Zamboanga Peninsula", "Northern Mindanao", "Davao Region", "SOCCSKSARGEN",
    "Caraga", "National Capital Region", "Cordillera Administrative Region",
    "Bangsamoro Autonomous Region"
]

INDUSTRIES = [
    "Information Technology", "Healthcare", "Education", "Finance", "Manufacturing",
    "Retail", "Government", "Hospitality", "Engineering", "BPO / Call Center",
    "Marketing / Advertising", "Agriculture", "Construction", "Telecommunications",
    "Legal Services", "Logistics", "Real Estate", "Media / Entertainment"
]

SALARY_RANGES = [
    "P15,000 - P20,000", "P20,000 - P30,000", "P30,000 - P40,000",
    "P40,000 - P50,000", "P50,000 - P70,000", "Above P70,000", "Below P15,000"
]

COMPETENCIES = [
    "Communication skills", "Leadership", "Problem-solving ability",
    "Technical / job-specific skills", "Teamwork", "Critical thinking",
    "Time management", "Adaptability", "Research skills", "Creativity"
]

NOT_EMPLOYED_REASONS = [
    "Pursuing further studies", "Family concerns", "Health reasons",
    "No job opportunity", "Preparing for licensure exam", "Waiting for board exam results"
]

REASONS_FOR_STAYING = [
    "Salary and benefits", "Career growth", "Job security", "Work-life balance",
    "Proximity to home", "Good working relationships", "Aligned with my course"
]


def random_date(start_year=2020, end_year=2025):
    start = datetime(start_year, 1, 1)
    end = datetime(end_year, 12, 31)
    delta = end - start
    return (start + timedelta(days=random.randint(0, delta.days))).isoformat()


def random_birthday():
    start = datetime(1975, 1, 1)
    end = datetime(2000, 12, 31)
    delta = end - start
    return (start + timedelta(days=random.randint(0, delta.days))).date().isoformat()


def random_mobile():
    return f"09{random.randint(100000000, 999999999)}"


def get_active_questionnaire():
    url = f"{SUPABASE_URL}/rest/v1/questionnaires?is_active=eq.true&select=id&order=created_at.desc&limit=1"
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200 and resp.json():
        return resp.json()[0]["id"]
    return None


def create_questionnaire():
    payload = {
        "title": "BU Graduate Tracer Study 2025-2026",
        "description": "Dummy questionnaire for analytics demonstration",
        "is_active": True,
        "batch_year": 2025,
        "deadline": "2026-06-30",
    }
    url = f"{SUPABASE_URL}/rest/v1/questionnaires"
    resp = requests.post(url, headers=HEADERS, json=payload)
    if resp.status_code in [200, 201]:
        return resp.json()[0]["id"] if isinstance(resp.json(), list) else resp.json().get("id")
    raise RuntimeError(f"Failed to create questionnaire: {resp.status_code} {resp.text}")


def fetch_profiles(limit=100):
    # Prefer dummy alumni accounts created by generate_dummy_profiles.py
    url = (
        f"{SUPABASE_URL}/rest/v1/profiles?"
        f"email=like.*@bualumni.test&select=id,first_name,middle_name,last_name,degree,college,batch_year&limit={limit}"
    )
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        profiles = resp.json()
        if profiles:
            return profiles

    # Fallback: any alumni profiles
    url = (
        f"{SUPABASE_URL}/rest/v1/profiles?"
        f"select=id,first_name,middle_name,last_name,degree,college,batch_year&limit={limit}"
    )
    resp = requests.get(url, headers=HEADERS)
    if resp.status_code == 200:
        return resp.json()
    raise RuntimeError(f"Failed to fetch profiles: {resp.status_code} {resp.text}")


def generate_survey(profile, questionnaire_id):
    response_id = str(uuid.uuid4())
    status = "submitted"
    submitted_at = random_date(2024, 2025)

    first = profile.get("first_name") or "First"
    middle = profile.get("middle_name")
    last = profile.get("last_name") or "Last"

    civil_status = random.choice(["single", "married", "separated", "single_parent", "widowed"])
    sex = random.choice(["male", "female"])
    province = random.choice(PHILIPPINE_PROVINCES)
    region = random.choice(REGIONS)
    location_type = random.choice(["city", "municipality"])

    employment_status = random.choices(
        ["employed", "not_employed", "never_employed"],
        weights=[70, 20, 10]
    )[0]

    response = {
        "id": response_id,
        "user_id": profile["id"],
        "questionnaire_id": questionnaire_id,
        "status": status,
        "submitted_at": submitted_at,
    }

    section_a = {
        "response_id": response_id,
        "first_name": first,
        "middle_name": middle,
        "last_name": last,
        "permanent_address": f"{random.randint(1, 999)} {random.choice(['Maple','Mahogany','Sampaguita','Rizal','Bonifacio'])} St., {province}",
        "civil_status": civil_status,
        "sex": sex,
        "birthday": random_birthday(),
        "region_of_origin": region,
        "province": province,
        "location_type": location_type,
        "mobile_number": random_mobile(),
    }

    degree = {
        "response_id": response_id,
        "degree_name": profile.get("degree") or "Bachelor of Science",
        "specialization": None,
        "college_university": profile.get("college") or "Baliuag University",
        "year_graduated": profile.get("batch_year") or random.randint(1990, 2025),
        "honors": random.choice([None, "Cum Laude", "Magna Cum Laude", "With Honors", None]),
        "sort_order": 0,
    }

    employment = {
        "response_id": response_id,
        "employment_status": employment_status,
        "not_employed_reasons": (
            random.sample(NOT_EMPLOYED_REASONS, k=random.randint(1, 2))
            if employment_status in ("not_employed", "never_employed")
            else None
        ),
        "present_emp_type": random.choice(["regular", "temporary", "contractual", "casual", "self_employed"]) if employment_status == "employed" else None,
        "present_occupation": random.choice(["Software Engineer", "Nurse", "Teacher", "Accountant", "Manager", "Analyst", "Supervisor", "Engineer"]) if employment_status == "employed" else None,
        "self_employed_skills": None,
        "major_line_of_business": random.choice(INDUSTRIES) if employment_status == "employed" else None,
        "place_of_work": random.choice(["local", "abroad"]) if employment_status == "employed" else None,
        "is_first_job": random.choice([True, False]) if employment_status == "employed" else None,
        "reasons_for_staying": random.sample(REASONS_FOR_STAYING, k=random.randint(1, 3)) if employment_status == "employed" else None,
        "reasons_for_accepting": random.sample(REASONS_FOR_STAYING, k=random.randint(1, 2)) if employment_status == "employed" else None,
        "reasons_for_changing": None,
        "duration_in_first_job": random.choice(["Less than 6 months", "6 months - 1 year", "1-2 years", "2-5 years", "More than 5 years"]) if employment_status == "employed" else None,
        "how_found_first_job": random.choice(["Job fair", "Online job portal", "Referral", "Walk-in application", "Social media"]) if employment_status == "employed" else None,
        "time_to_land_first_job": random.choice(["Immediately", "Less than 3 months", "3-6 months", "6-12 months", "More than a year"]) if employment_status == "employed" else None,
        "job_level_first": random.choice(["rank_clerical", "professional_technical", "managerial", "self_employed"]) if employment_status == "employed" else None,
        "job_level_current": random.choice(["rank_clerical", "professional_technical", "managerial", "self_employed"]) if employment_status == "employed" else None,
        "initial_monthly_earning": random.choice(SALARY_RANGES) if employment_status == "employed" else None,
        "is_curriculum_relevant": random.choice([True, False]) if employment_status == "employed" else None,
    }

    skills = {
        "response_id": response_id,
        "useful_competencies": random.sample(COMPETENCIES, k=random.randint(2, 5)),
        "curriculum_suggestions": random.choice([
            "More internships", "Additional technical courses", "Better career guidance",
            "Stronger English communication training", "More hands-on laboratory work"
        ]),
        "peer_referrals": [],
    }

    return response, section_a, degree, employment, skills


def insert_batch(table, rows):
    if not rows:
        return
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    resp = requests.post(url, headers=HEADERS, json=rows)
    if resp.status_code not in [200, 201]:
        raise RuntimeError(f"Failed to insert into {table}: {resp.status_code} {resp.text}")


def main():
    print("Fetching active questionnaire...")
    questionnaire_id = get_active_questionnaire()
    if not questionnaire_id:
        print("No active questionnaire found. Creating one...")
        questionnaire_id = create_questionnaire()
    print(f"Using questionnaire: {questionnaire_id}")

    print("Fetching profiles...")
    profiles = fetch_profiles(limit=100)
    print(f"Found {len(profiles)} profiles")

    # Skip profiles that already have a response for this questionnaire
    user_ids = [p["id"] for p in profiles]
    existing_url = (
        f"{SUPABASE_URL}/rest/v1/gts_responses?"
        f"questionnaire_id=eq.{questionnaire_id}&user_id=in.({','.join(user_ids)})&select=user_id"
    )
    existing_resp = requests.get(existing_url, headers=HEADERS)
    existing = {r["user_id"] for r in existing_resp.json()} if existing_resp.status_code == 200 else set()
    if existing:
        print(f"Skipping {len(existing)} profiles that already have responses")

    profiles = [p for p in profiles if p["id"] not in existing][:100]

    responses, section_as, degrees, employments, skills_feedbacks = [], [], [], [], []

    for profile in profiles:
        response, section_a, degree, employment, skills = generate_survey(profile, questionnaire_id)
        responses.append(response)
        section_as.append(section_a)
        degrees.append(degree)
        employments.append(employment)
        skills_feedbacks.append(skills)

    print(f"Inserting {len(responses)} dummy surveys...")
    insert_batch("gts_responses", responses)
    insert_batch("gts_section_a", section_as)
    insert_batch("gts_degrees", degrees)
    insert_batch("gts_employment", employments)
    insert_batch("gts_skills_feedback", skills_feedbacks)

    print(f"\n{'='*50}")
    print(f"Successfully inserted {len(responses)} dummy surveys")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
