import os
import io
import boto3
import json
import csv
import numpy as np

# grab environment variables
ENDPOINT_NAME = os.environ['ENDPOINT_NAME']
runtime= boto3.Session(region_name='us-east-2').client('runtime.sagemaker')
s3 = boto3.client('s3')
dynamodb = boto3.client('dynamodb')
table_name = 'LeafDiseaseMap'

object_categories = ['Not_a_leaf','Pepper__bell___Bacterial_spot','Pepper__bell___healthy','Potato___Early_blight','Potato___Late_blight','Potato___healthy', 'Tomato_Bacterial_spot','Tomato_Early_blight','Tomato_Late_blight','Tomato_Leaf_Mold','Tomato_Septoria_leaf_spot','Tomato_Spider_mites_Two_spotted_spider_mite','Tomato__Target_Spot','Tomato__Tomato_YellowLeaf__Curl_Virus','Tomato__Tomato_mosaic_virus','Tomato_healthy']

def lambda_handler(event, context):
    print(event)

    data = json.loads(json.dumps(event))
    bucket = data['bucket']
    image = data['key']
    os.chdir('/tmp/')
    session = boto3.session.Session(region_name='us-east-2')
    s3.download_file(bucket, image, '/tmp/image.jpg')
    res='/tmp/image.jpg'
    with open(res, 'rb') as f:
        payload = f.read()
        final_payload = bytearray(payload)
    response = runtime.invoke_endpoint(EndpointName=ENDPOINT_NAME, ContentType='application/x-image', Body=final_payload)
    result = response['Body'].read()
    result = json.loads(result)
    pred_label_id = np.argmax(result)
    probability=str(result[pred_label_id])
    a=(result[pred_label_id])
    b=a*100
    disease = object_categories[pred_label_id]
    '''Query against the dynamo db for the disease details'''
    output = dynamodb.get_item(TableName=table_name, Key={'DiseaseName':{'S':disease}})
    
    if 'Item' in output.keys() and object_categories[pred_label_id] !="Not_a_leaf":
        print("Yay!!")
        print({'Treatment': output['Item']['Treatment']['S'],
            'Description': output['Item']['Description']['S'],
            'statusCode': 200,
            'searchCode': 'Y',
            'Disease': disease
        })
        return {'Treatment': output['Item']['Treatment']['S'],
            'Description': output['Item']['Description']['S'],
            'Disease': output['Item']['DiseaseName_Format']['S'],
            'URL': output['Item']['Img_Url']['S'],
            'statusCode': 200,
            'searchCode': 'Y'
        }
    else:
        print({'statusCode': 200,
                'searchCode': 'N'
                })
        return {'statusCode': 200,
                'searchCode': 'N'
                }
