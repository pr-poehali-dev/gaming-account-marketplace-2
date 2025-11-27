import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление сделками (создание, оплата, подтверждение, чат)
    Args: event с httpMethod, body для создания/обновления сделок
    Returns: HTTP response с данными сделки
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
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
    action = params.get('action', 'list')
    headers = event.get('headers', {})
    user_id = int(headers.get('x-user-id', headers.get('X-User-Id', 0)))
    
    try:
        if method == 'POST' and action == 'create':
            body_data = json.loads(event.get('body', '{}'))
            offer_id = body_data.get('offer_id')
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходима авторизация'})
                }
            
            cursor.execute('''
                SELECT o.id, o.price, o.seller_id, o.title, u.username
                FROM t_p18833766_gaming_account_marke.offers o
                JOIN t_p18833766_gaming_account_marke.users u ON o.seller_id = u.id
                WHERE o.id = %s AND o.status = 'active'
            ''', (offer_id,))
            
            offer_row = cursor.fetchone()
            if not offer_row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Предложение не найдено'})
                }
            
            price = offer_row[1]
            seller_id = offer_row[2]
            title = offer_row[3]
            
            if seller_id == user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Нельзя купить свой товар'})
                }
            
            cursor.execute(
                'SELECT balance FROM t_p18833766_gaming_account_marke.users WHERE id = %s',
                (user_id,)
            )
            buyer_balance = cursor.fetchone()[0]
            
            total_amount = int(price * 1.05)
            
            if buyer_balance < total_amount:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Недостаточно средств. Нужно {total_amount}₽'})
                }
            
            cursor.execute('''
                INSERT INTO t_p18833766_gaming_account_marke.deals 
                (offer_id, buyer_id, seller_id, amount, status)
                VALUES (%s, %s, %s, %s, 'pending')
                RETURNING id
            ''', (offer_id, user_id, seller_id, total_amount))
            
            deal_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'deal_id': deal_id,
                    'message': 'Сделка создана',
                    'amount': total_amount
                })
            }
        
        elif method == 'POST' and action == 'pay':
            body_data = json.loads(event.get('body', '{}'))
            deal_id = body_data.get('deal_id')
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходима авторизация'})
                }
            
            cursor.execute('''
                SELECT d.id, d.buyer_id, d.seller_id, d.amount, d.status
                FROM t_p18833766_gaming_account_marke.deals d
                WHERE d.id = %s
            ''', (deal_id,))
            
            deal_row = cursor.fetchone()
            if not deal_row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Сделка не найдена'})
                }
            
            if deal_row[1] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Доступ запрещён'})
                }
            
            if deal_row[4] != 'pending':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Сделка уже оплачена'})
                }
            
            amount = deal_row[3]
            
            cursor.execute(
                'UPDATE t_p18833766_gaming_account_marke.users SET balance = balance - %s WHERE id = %s',
                (amount, user_id)
            )
            
            cursor.execute(
                'UPDATE t_p18833766_gaming_account_marke.deals SET status = %s WHERE id = %s',
                ('paid', deal_id)
            )
            
            cursor.execute('''
                INSERT INTO t_p18833766_gaming_account_marke.transactions 
                (user_id, deal_id, amount, type)
                VALUES (%s, %s, %s, 'payment')
            ''', (user_id, deal_id, -amount))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Оплата прошла успешно', 'status': 'paid'})
            }
        
        elif method == 'POST' and action == 'complete':
            body_data = json.loads(event.get('body', '{}'))
            deal_id = body_data.get('deal_id')
            
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходима авторизация'})
                }
            
            cursor.execute('''
                SELECT d.id, d.buyer_id, d.seller_id, d.amount, d.status
                FROM t_p18833766_gaming_account_marke.deals d
                WHERE d.id = %s
            ''', (deal_id,))
            
            deal_row = cursor.fetchone()
            if not deal_row or deal_row[1] != user_id:
                return {
                    'statusCode': 403,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Доступ запрещён'})
                }
            
            if deal_row[4] != 'paid':
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Сделка не оплачена'})
                }
            
            seller_id = deal_row[2]
            amount = deal_row[3]
            seller_amount = int(amount * 0.95)
            
            cursor.execute(
                'UPDATE t_p18833766_gaming_account_marke.users SET balance = balance + %s WHERE id = %s',
                (seller_amount, seller_id)
            )
            
            cursor.execute(
                'UPDATE t_p18833766_gaming_account_marke.deals SET status = %s, completed_at = CURRENT_TIMESTAMP WHERE id = %s',
                ('completed', deal_id)
            )
            
            cursor.execute('''
                INSERT INTO t_p18833766_gaming_account_marke.transactions 
                (user_id, deal_id, amount, type)
                VALUES (%s, %s, %s, 'payout')
            ''', (seller_id, deal_id, seller_amount))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Сделка завершена', 'status': 'completed'})
            }
        
        elif method == 'GET' and action == 'my-deals':
            if not user_id:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Необходима авторизация'})
                }
            
            cursor.execute('''
                SELECT d.id, o.title, d.amount, d.status, d.created_at,
                       buyer.username as buyer_name, seller.username as seller_name,
                       d.buyer_id, d.seller_id
                FROM t_p18833766_gaming_account_marke.deals d
                JOIN t_p18833766_gaming_account_marke.offers o ON d.offer_id = o.id
                JOIN t_p18833766_gaming_account_marke.users buyer ON d.buyer_id = buyer.id
                JOIN t_p18833766_gaming_account_marke.users seller ON d.seller_id = seller.id
                WHERE d.buyer_id = %s OR d.seller_id = %s
                ORDER BY d.created_at DESC
                LIMIT 50
            ''', (user_id, user_id))
            
            rows = cursor.fetchall()
            deals = []
            for row in rows:
                deals.append({
                    'id': row[0],
                    'title': row[1],
                    'amount': row[2],
                    'status': row[3],
                    'created_at': row[4].isoformat() if row[4] else None,
                    'buyer': row[5],
                    'seller': row[6],
                    'is_buyer': row[7] == user_id
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'deals': deals})
            }
        
        elif method == 'POST' and action == 'send-message':
            body_data = json.loads(event.get('body', '{}'))
            deal_id = body_data.get('deal_id')
            message = body_data.get('message', '').strip()
            
            if not user_id or not message:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните сообщение'})
                }
            
            cursor.execute('''
                INSERT INTO t_p18833766_gaming_account_marke.messages 
                (deal_id, user_id, message)
                VALUES (%s, %s, %s)
                RETURNING id
            ''', (deal_id, user_id, message))
            
            message_id = cursor.fetchone()[0]
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message_id': message_id, 'message': 'Сообщение отправлено'})
            }
        
        elif method == 'GET' and action == 'messages':
            deal_id = params.get('deal_id')
            
            if not user_id or not deal_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Параметры не указаны'})
                }
            
            cursor.execute('''
                SELECT m.id, m.message, m.created_at, u.username, m.user_id
                FROM t_p18833766_gaming_account_marke.messages m
                JOIN t_p18833766_gaming_account_marke.users u ON m.user_id = u.id
                WHERE m.deal_id = %s
                ORDER BY m.created_at ASC
            ''', (deal_id,))
            
            rows = cursor.fetchall()
            messages = []
            for row in rows:
                messages.append({
                    'id': row[0],
                    'message': row[1],
                    'created_at': row[2].isoformat() if row[2] else None,
                    'username': row[3],
                    'is_own': row[4] == user_id
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages})
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
