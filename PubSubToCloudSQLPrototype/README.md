# Pub/Sub To CloudSQL Prototype
This project was set up as a prototype for Decisioning to prove that messages added to pubsub can trigger a cloud function which then adds/updates the data in CloudSQL.

## Pre-Requisites
- A Google Cloud project, this could be your own using: https://cloud.google.com/free/ 
- Install gcloud CLI (https://cloud.google.com/sdk/install) locally on laptop
- Run gcloud init (https://cloud.google.com/sdk/gcloud/reference/init) locally on laptop
- Enable Cloud Pub/Sub API, Cloud Functions API, Google Cloud SQL and Cloud SQL Admin API on your Google Cloud Project
- Install NPM (https://docs.npmjs.com/cli/install) locally on laptop
- Visual Studio Code installed locally on laptop

## Create PubSub topic
Set up a PubSub topic through the GCP UI or using the following from the Cloud Shell or locally from your command prompt.
```
gcloud init
gcloud pubsub topics create decisioningTopic
```

## Set up Cloud SQL Database
Load Cloud Shell and run the following: -
```
gcloud config set project name-of-your-project
gcloud sql instances create decisioninginst --region=europe-west1 --database-version=MYSQL_5_7 --tier=db-f1-micro 
gcloud sql instances patch --assign-ip decisioninginst
gcloud sql users set-password root % --instance decisioninginst --password [PASSWORD]
gcloud sql users create decisioninguser % --instance=decisioninginst --password [PASSWORD]
gcloud sql databases create decisioningdatabase --instance=decisioninginst
gcloud sql connect decisioninginst --user=root
```

## Create CustomerAttributes Table
Run the following in the Cloud SQL shell: -
```sql
use decisioningdatabase;
CREATE TABLE CustomerAttributes(TrackingID varchar(100), AccountNumber varchar(20), ProfilingAllowed boolean, ProdLatestDTVStatus varchar(50), AcctSubType varchar(100), MoviesUpgradeScore decimal(20, 18), SportsUpgradeScore decimal(20, 18), TopTierUpgradeScore decimal(20, 18), SkyGoExtraUpgradeScore decimal(20, 18), FamilyUpgradeScore decimal(20, 18), BroadbandUpgradeScore decimal(20, 18), FibreUpgradeUpgradeScore decimal(20, 18), FibreRegradeUpgradeScore decimal(20, 18), MultiscreenUpgradeScore decimal(20, 18), QUpgradeScore decimal(20, 18), BKUpgradeScore decimal(20, 18), StoreRentUpgradeScore decimal(20, 18), MobileTariffUpgradeScore decimal(20, 18), MobileHandsetUpgradeScore decimal(20, 18), SportsROIUpgradeScore decimal(20, 18), MoviesROIUpgradeScore decimal(20, 18), HDROIUpgradeScore decimal(20, 18), BBROIUpgradeScore decimal(20, 18), MoviesOfferEligibility boolean, SportsOfferEligibility boolean, TopTierOfferEligibility boolean, SkyGoExtraOfferEligibility boolean, FamilyOfferEligibility boolean, BroadbandOfferEligibility boolean, FibreUpgradeOfferEligibility boolean, FibreRegradeOfferEligibility boolean, MultiscreenOfferEligibility boolean, QOfferEligibility boolean, BKOfferEligibility Boolean, StoreRentOfferEligibility boolean, MobileTariffOfferEligibility boolean, MobileHandsetOfferEligibility boolean, SportsROIOfferEligibility boolean, MoviesROIOfferEligibility boolean, HDROIOfferEligibility boolean, BBROIOfferEligibility boolean, LastModifiedDate datetime, PRIMARY KEY(TrackingID));
```

## Deploy Node.js Code to Cloud Functions and Set Up Environment Variables
Open the PubSubToCloudSQLPrototype Node.js project in Visual Studio.
Right click on the project name and select `Open Command Prompt Here`
Run the following from the command prompt: -

```
gcloud beta functions deploy PubSubToCloudSQLPrototype --trigger-resource decisioningTopic --trigger-event google.pubsub.topic.publish --region europe-west1 --runtime nodejs8 --env-vars-file env.yaml 
```

## Test
Check that the cloud function appears on the GCP UI and check that the PubSub topic has one subscription. 

Post the following message to the PubSub topic: -
```
{
  "TrackingID": "SOMEMADEUPTRACKINGID==",
  "AccountNumber":  0,
  "ProfilingAllowed":  1,
  "ProdLatestDTVStatus": "Active",
  "AcctSubType": "Active",
  "MoviesUpgradeScore": 0.1,
  "SportsUpgradeScore": 0.2,
  "TopTierUpgradeScore": 0.3,
  "SkyGoExtraUpgradeScore": 0.4,
  "FamilyUpgradeScore": 0.5,
  "BroadbandUpgradeScore": 0.6,
  "FibreUpgradeUpgradeScore": 0.7,
  "FibreRegradeUpgradeScore": 0.8,
  "MultiscreenUpgradeScore": 0.9,
  "QUpgradeScore": 0.10,
  "BKUpgradeScore": 0.11,
  "StoreRentUpgradeScore": 0.12,
  "MobileTariffUpgradeScore": 0.13,
  "MobileHandsetUpgradeScore": 0.14,
  "SportsROIUpgradeScore": 0.15,
  "MoviesROIUpgradeScore": 0.16,
  "HDROIUpgradeScore": 0.17,
  "BBROIUpgradeScore": 0.18,
  "MoviesOfferEligibility": 0,
  "SportsOfferEligibility": 1,
  "TopTierOfferEligibility": 0,
  "SkyGoExtraOfferEligibility": 1,
  "FamilyOfferEligibility": 0,
  "BroadbandOfferEligibility": 1,
  "FibreUpgradeOfferEligibility": 0,
  "FibreRegradeOfferEligibility": 1,
  "MultiscreenOfferEligibility": 0,
  "QOfferEligibility": 1,
  "BKOfferEligibility": 1,
  "StoreRentOfferEligibility": 1,
  "MobileTariffOfferEligibility": 1,
  "MobileHandsetOfferEligibility": 1,
  "SportsROIOfferEligibility": 1,
  "MoviesROIOfferEligibility": 1,
  "HDROIOfferEligibility": 1,
  "BBROIOfferEligibility": 1
}
```
Check the cloud function logs to see if the record was inserted into the database. 

Run the following from the Cloud SQL shell: -
```sql
select * from CustomerAttributes;
```

## View results in MySQL Workbench
To interact with Cloud SQL on your local machine or develop on your local machine connecting directly to Cloud SQL you will need to run a proxy.  Download the Cloud SQL Proxy from https://cloud.google.com/sql/docs/mysql/sql-proxy. 
Once installed run CMD and navigate to the folder where the exe was saved. 
Run the following command replacing the project name and instance name: -
```
cloud_sql_proxy.exe -instances=projectname:europe-west1:decisioninginst=tcp:3306
```
Install MySQL Workbench from: -
https://dev.mysql.com/downloads/workbench/


## Clear Down
You will be continue to be charged for Cloud SQL if you leave it running, remove the database instance by running the following from Cloud Shell: -
```
gcloud sql instances delete decisioninginst
gcloud beta functions delete PubSubToCloudSQLPrototype --region europe-west1
gcloud pubsub topics delete decisioningTopic
```

## Troubleshooting
If there are errors deploying from your local machine then make sure the gcloud components are up to date.
When creating the database instance if there is an error regarding it taking longer than expected then check in the GCP UI that it has been set up.
Use the Stackdriver logs to track down errors.



