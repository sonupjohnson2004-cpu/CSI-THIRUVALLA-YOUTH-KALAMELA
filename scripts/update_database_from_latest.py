import sqlite3
import json
from datetime import datetime

def run_update():
    conn = sqlite3.connect('data/talent_show.db')
    cursor = conn.cursor()
    now = datetime.utcnow().isoformat() + 'Z'

    # 1. Update result items
    items_data = [
        # (id, category, round, segment, status, 1st_name, 1st_details, 2nd_name, 2nd_details, 3rd_name, 3rd_details)
        (
            'ev_01', 'Solo Western Senior Girls', 'Finals', 'Individual Music', 'completed',
            'NICSU SUSAN LITTY', 'Chest #281 • Kaviyoor',
            'SANDRA STANLEY', 'Chest #531 • Tholassery',
            'MEENU SARA BABU', 'Chest #431 • Othera'
        ),
        (
            'ev_02', 'Short Story English', 'Finals', 'Literary Arts', 'completed',
            'STOJI PAUL THOMAS', 'Chest #351 • Melpadom',
            'HODGES PAUL JAMES', 'Chest #134 • Eraviperoor',
            'CHRIS GEORGE RIJU', 'Chest #261 • Kaviyoor'
        ),
        (
            'ev_03', 'Light Music Boys', 'Finals', 'Individual Music', 'completed',
            'BIJEESH ISSAC', 'Chest #230 • Karikkuzhy',
            'ASHBIN REJI', 'Chest #279 • Kunnamthanam',
            'SAM TITUS THOMAS', 'Chest #397 • Mundiappally'
        ),
        (
            'ev_04', 'Solo Eastern Senior Boys', 'Finals', 'Individual Music', 'completed',
            'DR. EMIL GEORGE', 'Chest #525 • Tholassery',
            'NEIL KURUVILA', 'Chest #390 • Mundiapally',
            'JESWIN P VARGHESE', 'Chest #254 • Kaviyoor'
        ),
        (
            'ev_05', 'Light Music Girls', 'Finals', 'Individual Music', 'completed',
            'ASIN ANNA ANEESH', 'Chest #202 • Kannamkaramodi',
            'MAHUS GRACE', 'Chest #406 • Mundukotta',
            'ALEENA MARIAM VARKEY', 'Chest #527 • Tholassery'
        ),
        (
            'ev_06', 'Quartet', 'Finals', 'Group Music', 'completed',
            'Kaviyoor Unit', 'Chest Q1 • Kaviyoor',
            'Tholassery Unit', 'Chest Q3 • Tholassery',
            'Mundiapally Unit', 'Chest Q2 • Mundiapally'
        ),
        (
            'ev_07', 'Solo Western Junior Boys', 'Finals', 'Individual Music', 'completed',
            'JERMIAH VARGHESE', 'Chest #377 • Mundiappally',
            'LIJIN SAJI SAMUEL', 'Chest #528 • Tholassery',
            'SANKEERTHAN MATHEW', 'Chest #381 • Mundiappally'
        ),
        (
            'ev_08', 'Elocution Malayalam Senior', 'Finals', 'Speech & Oratory', 'completed',
            'JIMY SARA JACOB', 'Chest #386 • Mundiapally',
            'SUREJ K ABBHRAHAM', 'Chest #393 • Mundiapally',
            'MEENU SARA', 'Chest #431 • Othera'
        ),
        (
            'ev_09', 'Solo Eastern Junior Boys', 'Finals', 'Individual Music', 'completed',
            'LIJIN SAJI SAMUEL', 'Chest #528 • Tholassery',
            'JEREMIAH VARGHESE', 'Chest #377 • Mundiappally',
            'SANKEERTHAN MATHEW', 'Chest #381 • Mundiappally'
        ),
        (
            'ev_10', 'Pencil Drawing', 'Finals', 'Fine Arts', 'completed',
            'ASHLIN SHAJI', 'Chest #302 • Kuttoor',
            'ETHEN ARTHUR SAMUEL', 'Chest #535 • Tholassery',
            'ASHWIN CHERRY MATHEW', 'Chest #382 • Mundiappally'
        ),
        (
            'ev_11', 'Solo Western Senior Boys', 'Finals', 'Individual Music', 'completed',
            'JESVIN P VARGHESE', 'Chest #254 • Kaviyoor',
            'DR. EMIL GEORGE', 'Chest #525 • Tholassery',
            'ABEL K GEORGE', 'Chest #257 • Kaviyoor'
        ),
        (
            'ev_12', 'Cartoon Drawing', 'Finals', 'Fine Arts', 'completed',
            'TIJU STEPHEN', 'Chest #283 • Kunnamthanam',
            'SURAJ K ABRAHAM', 'Chest #393 • Mundiappally',
            'PRETTY ANNA JOHN', 'Chest #391 • Mundiappally'
        ),
        (
            'ev_13', 'Solo Eastern Junior Girls', 'Finals', 'Individual Music', 'completed',
            'JEMIMA MOLLY SHAJI', 'Chest #376 • Mundiappally',
            'DIYA SUSAN JOHNS', 'Chest #529 • Tholassery',
            'EMILIA ANNA SAM', 'Chest #375 • Mundiappally'
        ),
        (
            'ev_14', 'Water Colour Painting', 'Finals', 'Fine Arts', 'completed',
            'SANDRA STANLY', 'Chest #532 • Tholassery',
            'BIBIN THOMAS', 'Chest #281 • Kunnamthanam',
            'ASHLIN SHAJI', 'Chest #302 • Kuttoor'
        ),
        (
            'ev_15', 'Solo Eastern Senior Girls', 'Finals', 'Individual Music', 'completed',
            'NICSU SUSAN LITTY', 'Chest #251 • Kaviyoor',
            'SWETHA SUSAN ISSAC', 'Chest #259 • Kaviyoor',
            'LEANA MERIN ISSAC', 'Chest #531 • Tholassery'
        ),
        (
            'ev_16', 'Poetry Writing Malayalam', 'Finals', 'Literary Arts', 'completed',
            'LUDIYA JAYAN', 'Chest #150 • Kalangara',
            'JOSSY SARA GEORGE', 'Chest #476 • Thalavady',
            'SHERIMON P C', 'Chest #405 • Mundukotta'
        ),
        (
            'ev_17', 'Solo Western Junior Girls', 'Finals', 'Individual Music', 'completed',
            'JEMIMA MOLLY SHAJI', 'Chest #376 • Mundiappally',
            'ALEENA MARIAM VARKEY', 'Chest #527 • Tholassery',
            'DIYA SUSAN JOHNS', 'Chest #529 • Tholassery'
        ),
        (
            'ev_18', 'Essay Writing Malayalam Junior', 'Finals', 'Literary Arts', 'completed',
            'ALKHA SABU', 'Chest #425 • Othera',
            'EMILIA ANNA SAM', 'Chest #375 • Mundiapally',
            'ALEENA ALEX', 'Chest #502 • Theepany'
        ),
        (
            'ev_19', 'Elocution Malayalam Junior', 'Finals', 'Speech & Oratory', 'completed',
            'ALFA MARY REJI', 'Chest #451 • Povathoor',
            'LIVIA ANNA VARKEY', 'Chest #379 • Mundiappally',
            'RAYANA MARIAM', 'Chest #228 • Karikkuzhy'
        ),
        (
            'ev_20', 'Instrumental - Percussion', 'Finals', 'Instrumental Music', 'completed',
            'SHERIN REJI VARGHESE', 'Chest #394 • Mundiappally',
            'ABIN BINU', 'Chest #289 • Kunnamthanam',
            'EETHAN ARTHUR', 'Chest #535 • Tholassery'
        ),
        (
            'ev_21', 'Elocution English Senior', 'Finals', 'Speech & Oratory', 'completed',
            'MICHAEL MARIAM NEBU', 'Chest #389 • Mundiappally',
            'SOORAJ K ABHRAHAM', 'Chest #393 • Mundiappally',
            'AMIT OOMMEN GEORGE', 'Chest #537 • Tholassery'
        ),
        (
            'ev_22', 'Group Song', 'Finals', 'Group Music', 'completed',
            'Tholassery Unit', 'Chest G7 • Tholassery',
            'Kaviyoor Unit', 'Chest G3 • Kaviyoor',
            'Theeppani Unit', 'Chest G6 • Theepani'
        ),
        (
            'ev_23', 'Elocution English Junior', 'Finals', 'Speech & Oratory', 'partially_announced',
            'JEREMIAH VARGHESE', 'Chest #377 • Mundiappally',
            'JEMIMA MOLLY SHAJI', 'Chest #376 • Mundiappally',
            None, None
        ),
        (
            'ev_24', 'Instrumental - Organ / Keyboard', 'Finals', 'Instrumental Music', 'pending',
            None, None,
            None, None,
            None, None
        ),
        (
            'ev_25', 'Instrumental - Violin', 'Finals', 'Instrumental Music', 'partially_announced',
            'CHRISTINE ELIZABETH', 'Chest #384 • Mundiappally',
            'EMILIA ANNA SAM', 'Chest #375 • Mundiappally',
            None, None
        ),
        (
            'ev_26', 'Classical Music', 'Finals', 'Classical Vocals', 'partially_announced',
            'DR. EMIL GEORGE', 'Chest #525 • Tholassery',
            None, None,
            None, None
        ),
        (
            'ev_27', 'Short Story Malayalam', 'Finals', 'Literary Arts', 'completed',
            'JULIE JAMES', 'Chest #285 • Kunnamthanam',
            'ALEYAMMA THOMAS', 'Chest #501 • Theepani',
            'DEEPTHI MARY JOHN', 'Chest #385 • Mundiappally'
        ),
        (
            'ev_28', 'Mimicry', 'Finals', 'Performing Arts', 'completed',
            'MATHEW K MATHEW', 'Chest #263 • Kaviyoor',
            'ASHBIN REJI', 'Chest #279 • Kunnamthanam',
            'JIMY SARA JACOB', 'Chest #386 • Mundiappally'
        ),
        (
            'ev_29', 'Tableau', 'Finals', 'Theatre & Dramatics', 'completed',
            'Karikkuzhy Unit', 'Chest T4 • Karikkuzhy',
            'Mundiapally Unit', 'Chest T5 • Mundiapally',
            'Tholassery Unit', 'Chest T8 • Tholassery'
        ),
        (
            'ev_30', 'Fancy Dress', 'Finals', 'Performing Arts', 'completed',
            'NANMA SHAJI', 'Chest #536 • Tholassery',
            'ETHAN ARTHUR', 'Chest #535 • Tholassery',
            'ABEX K & DEEPTHI MARY JOHN (Tied)', 'Chest #275 (Kunnamthanam) & Chest #385 (Mundiappally)'
        ),
        (
            'ev_31', 'Essay Writing English Senior', 'Finals', 'Literary Arts', 'completed',
            'SUREJ K ABRAHAM', 'Chest #393 • Mundiappally',
            'ASHIYA C BENJAMIN', 'Chest #427 • Othera',
            'NEETHU MERIN JOSE & CHRISTEENA RAICHAL GEORGE (Tied)', 'Chest #454 (Poovathoor) & Chest #253 (Kaviyoor)'
        ),
        (
            'ev_32', 'Monoact', 'Finals', 'Theatre & Dramatics', 'completed',
            'DR. EMIL GEORGE', 'Chest #525 • Tholassery',
            'ALKA SABU', 'Chest #425 • Othera',
            'JERUSA SIJU', 'Chest #429 • Othera'
        ),
        (
            'ev_33', 'Mime', 'Finals', 'Theatre & Dramatics', 'completed',
            'Team M3', 'Chest M3',
            'Team M2', 'Chest M2',
            'Team M1', 'Chest M1'
        ),
        (
            'ev_34', 'Poetry Writing English', 'Finals', 'Literary Arts', 'completed',
            'SUREJ K ABRAHAM', 'Chest #393 • Mundiappally',
            'AMITH OOMMEN GEORGE', 'Chest #537 • Tholassery',
            'NIBIN JOSE', 'Chest #286 • Kunnamthanam'
        ),
    ]

    for item in items_data:
        cursor.execute('''
            UPDATE result_items SET
                category = ?, round = ?, segment = ?, status = ?,
                first_place_name = ?, first_place_details = ?,
                second_place_name = ?, second_place_details = ?,
                third_place_name = ?, third_place_details = ?,
                updated_at = ?
            WHERE id = ? AND edition_id = 'show_2026'
        ''', (
            item[1], item[2], item[3], item[4],
            item[5], item[6],
            item[7], item[8],
            item[9], item[10],
            now, item[0]
        ))
    print(f'Successfully updated {len(items_data)} result items.')

    # 2. Update Church Points
    church_data = [
        # (unit, section, sl_no, total, scores_dict)
        ('Karikuzhy', 1, 1, 26, {'Light Music Boys': 10, 'Tableau': 10, 'Elocution Mal Jr': 6}),
        ('Kaviyoor', 1, 2, 90, {'Solo Western Sr Boys': 16, 'Solo Eastern Sr Boys': 6, 'Solo Western Sr Girls': 10, 'Solo Eastern Sr Girls': 18, 'Quartet': 10, 'Group Song': 8, 'Mimicry': 10, 'Short Story English': 6, 'Essay Eng SR': 6}),
        ('Kumbanad', 1, 3, 0, {}),
        ('Kunnamthanam', 1, 4, 64, {'Light Music Boys': 8, 'Instrumental Percussion': 8, 'Mimicry': 8, 'Fancy Dress': 6, 'Cartoon': 10, 'Water Colour': 8, 'Poetry English': 6, 'Short Story Malayalam': 10}),
        ('Kuttoor', 1, 5, 16, {'Water Colour': 6, 'Pencil Drawing': 10}),
        ('Mundiappally', 1, 6, 240, {
            'Light Music Boys': 6, 'Solo Western Jr Boys': 16, 'Solo Eastern Jr Boys': 14,
            'Solo Eastern Sr Boys': 8, 'Solo Western Jr Girls': 10, 'Solo Eastern Jr Girls': 16,
            'Instrumental VIOLIN': 18, 'Instrumental Percussion': 10, 'Quartet': 6, 'Tableau': 8,
            'Mimicry': 6, 'Fancy Dress': 6, 'Cartoon': 14, 'Pencil Drawing': 6,
            'Essay Eng SR': 10, 'Essay Mal JR': 8, 'Poetry English': 10, 'Short Story Malayalam': 6,
            'Elocution Mal Jr': 8, 'Elocution Eng Jr': 18, 'Elocution Mal Sr': 18, 'Elocution Eng Sr': 18
        }),
        ('Perumthuruthy', 1, 7, 0, {}),
        ('Thalavady', 1, 8, 8, {'Poetry Malayalam': 8}),
        ('Tholassery', 1, 9, 168, {
            'Solo Western Jr Boys': 8, 'Solo Eastern Jr Boys': 10, 'Solo Western Sr Boys': 8,
            'Solo Eastern Sr Boys': 10, 'Light Music Girls': 6, 'Solo Western Jr Girls': 14,
            'Solo Eastern Jr Girls': 8, 'Solo Western Sr Girls': 8, 'Solo Eastern Sr Girls': 6,
            'Instrumental Percussion': 6, 'Quartet': 8, 'Group Song': 10, 'Tableau': 6,
            'Mono Act': 10, 'Fancy Dress': 18, 'Water Colour': 10, 'Pencil Drawing': 8,
            'Poetry English': 8, 'Elocution Eng Sr': 6
        }),
        ('Poovathoor', 1, 10, 16, {'Essay Eng SR': 6, 'Elocution Mal Jr': 10}),
        ('Warikkadu', 1, 11, 0, {}),
        ('Valanjavattom', 1, 12, 0, {}),
        ('Arayapuram', 2, 1, 0, {}),
        ('Kaniyampara', 2, 2, 0, {}),
        ('Kanjirapara', 2, 3, 0, {}),
        ('Kannamkarmodi', 2, 4, 10, {'Light Music Girls': 10}),
        ('Melpadam', 2, 5, 10, {'Short Story English': 10}),
        ('Mundukotta', 2, 6, 14, {'Light Music Girls': 8, 'Poetry  Malayalam': 6}),
        ('Othera', 2, 7, 44, {'Solo Western Sr Girls': 6, 'Mono Act': 14, 'Essay Eng SR': 8, 'Essay Mal JR': 10, 'Elocution Mal Sr': 6}),
        ('Theepani', 2, 8, 22, {'Group Song': 6, 'Essay Mal JR': 8, 'Short Story Malayalam': 8}),
        ('Eraviperoor', 2, 9, 8, {'Short Story English': 8}),
        ('Kalangara', 2, 10, 10, {'Poetry  Malayalam': 10}),
        ('kuttapuzha', 2, 11, 0, {}),
    ]

    # Calculate ranks with ties
    sorted_churches = sorted(church_data, key=lambda c: c[3], reverse=True)
    ranks = {}
    current_rank = 1
    for i, c in enumerate(sorted_churches):
        if i > 0 and c[3] < sorted_churches[i-1][3]:
            current_rank = i + 1
        ranks[c[0]] = current_rank

    # Clear and re-insert or update church_points
    cursor.execute("DELETE FROM church_points WHERE edition_id = 'show_2026'")
    for ch in church_data:
        unit, sec, sl, tot, scores = ch
        rk = ranks[unit]
        ch_id = f"cp_show_2026_s{sec}_{sl}"
        cursor.execute('''
            INSERT INTO church_points (id, edition_id, sl_no, section, unit_name, total_points, event_scores, rank)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            ch_id, 'show_2026', sl, sec, unit, tot, json.dumps(scores), rk
        ))

    # Update app_metadata touch
    cursor.execute("INSERT OR REPLACE INTO app_metadata (key, value) VALUES ('last_updated_at', ?)", (now,))

    conn.commit()
    conn.close()
    print('Church points updated successfully for 23 units.')

if __name__ == '__main__':
    run_update()
