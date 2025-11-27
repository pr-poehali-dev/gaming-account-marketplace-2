import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для получения игр, предложений и создания сделок
    Args: event с httpMethod, queryStringParameters, body
    Returns: HTTP response с данными из БД
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    cursor = conn.cursor()
    
    params = event.get('queryStringParameters', {}) or {}
    action = params.get('action', 'offers')
    
    try:
        if method == 'GET' and action == 'games':
            cursor.execute('''
                SELECT g.id, g.name, g.image, g.regions,
                       json_agg(json_build_object('id', gc.id, 'name', gc.name)) as categories
                FROM t_p18833766_gaming_account_marke.games g
                LEFT JOIN t_p18833766_gaming_account_marke.game_categories gc ON g.id = gc.game_id
                GROUP BY g.id, g.name, g.image, g.regions
                ORDER BY g.name
            ''')
            
            rows = cursor.fetchall()
            games = []
            for row in rows:
                games.append({
                    'id': row[0],
                    'name': row[1],
                    'image': row[2],
                    'regions': row[3] if row[3] else [],
                    'categories': [cat for cat in row[4] if cat['id'] is not None]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'games': games})
            }
        
        elif method == 'GET' and action == 'offers':
            game_id = params.get('game_id', None)
            
            query = '''
                SELECT o.id, g.name as game, gc.name as category, u.username as seller,
                       o.title, o.description, o.price, u.rating, u.reviews_count, u.is_online
                FROM t_p18833766_gaming_account_marke.offers o
                JOIN t_p18833766_gaming_account_marke.games g ON o.game_id = g.id
                JOIN t_p18833766_gaming_account_marke.game_categories gc ON o.category_id = gc.id
                JOIN t_p18833766_gaming_account_marke.users u ON o.seller_id = u.id
                WHERE o.status = 'active'
            '''
            
            if game_id:
                query += f" AND o.game_id = {int(game_id)}"
            
            query += " ORDER BY o.created_at DESC LIMIT 50"
            
            cursor.execute(query)
            rows = cursor.fetchall()
            
            offers = []
            for row in rows:
                offers.append({
                    'id': row[0],
                    'game': row[1],
                    'category': row[2],
                    'seller': row[3],
                    'title': row[4] if row[4] else row[5],
                    'description': row[5],
                    'price': row[6],
                    'rating': float(row[7]) if row[7] else 0,
                    'reviews': row[8],
                    'online': row[9]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'offers': offers})
            }
        
        elif method == 'POST' and action == 'create-offer':
            body_data = json.loads(event.get('body', '{}'))
            headers = event.get('headers', {})
            seller_id = int(headers.get('x-user-id', headers.get('X-User-Id', 0)))
            
            if not seller_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходима авторизация'})
                }
            
            game_id = body_data.get('game_id')
            category_id = body_data.get('category_id')
            title = body_data.get('title')
            description = body_data.get('description', '')
            price = body_data.get('price')
            
            if not all([game_id, category_id, title, price]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'})
                }
            
            cursor.execute('''
                INSERT INTO t_p18833766_gaming_account_marke.offers 
                (game_id, category_id, seller_id, title, description, price)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (game_id, category_id, seller_id, title, description, price))
            
            offer_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': offer_id, 'message': 'Объявление создано'})
            }
        
        elif method == 'GET' and action == 'my-offers':
            headers = event.get('headers', {})
            seller_id = int(headers.get('x-user-id', headers.get('X-User-Id', 0)))
            
            if not seller_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходима авторизация'})
                }
            
            cursor.execute('''
                SELECT o.id, g.name as game, gc.name as category,
                       o.title, o.description, o.price, o.status, o.created_at
                FROM t_p18833766_gaming_account_marke.offers o
                JOIN t_p18833766_gaming_account_marke.games g ON o.game_id = g.id
                JOIN t_p18833766_gaming_account_marke.game_categories gc ON o.category_id = gc.id
                WHERE o.seller_id = %s
                ORDER BY o.created_at DESC
            ''', (seller_id,))
            
            rows = cursor.fetchall()
            offers = []
            for row in rows:
                offers.append({
                    'id': row[0],
                    'game': row[1],
                    'category': row[2],
                    'title': row[3],
                    'description': row[4],
                    'price': row[5],
                    'status': row[6],
                    'created_at': row[7].isoformat() if row[7] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'offers': offers})
            }
        
        else:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Not found'})
            }
    
    finally:
        cursor.close()
        conn.close()