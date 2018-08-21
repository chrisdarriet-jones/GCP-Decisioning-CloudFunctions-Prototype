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
gcloud sql instances create decisioninginstance --region=europe-west1 --database-version=MYSQL_5_7 --tier=db-f1-micro 
gcloud sql instances patch --assign-ip decisioninginstance
gcloud sql users set-password root % --instance decisioninginstance --password [PASSWORD]
gcloud sql users create decisioninguser % --instance=decisioninginstance --password [PASSWORD]
gcloud sql databases create decisioningdatabase --instance=decisioninginstance
gcloud sql connect decisioninginstance --user=root
```

## Create CustomerAttributes Table
Run the following in the Cloud SQL shell: -
```sql
use decisioningdatabase;
CREATE TABLE CustomerAttributes(TrackingID varchar(100), MoviesUpliftScore decimal(20, 18), SportsUpliftScore decimal(20, 18), TopTierUpliftScore decimal(20, 18), SkyGoExtraUpliftScore decimal(20, 18), FamilyUpliftScore decimal(20, 18), BroadbandUpliftScore decimal(20, 18), FibreUpgradeUpliftScore decimal(20, 18), FibreRegradeUpliftScore decimal(20, 18), MultiscreenUpliftScore decimal(20, 18), QUpgradeScore decimal(20, 18), BKUpgradeScore decimal(20, 18), StoreRentUpgradeScore decimal(20, 18), MobileTariffUpgradeScore decimal(20, 18), MobileHandsetUpgradeScore decimal(20, 18), SportsROIUpgradeScore decimal(20, 18), MoviesROIUpgradeScore decimal(20, 18), HDROIUpgradeScore decimal(20, 18), BBROIUpgradeScore decimal(20, 18), MoviesOfferEligibility boolean, SportsOfferEligibility boolean, TopTierOfferEligibility boolean, SkyGoExtraOfferEligibility boolean, FamilyOfferEligibility boolean, BroadbandOfferEligibility boolean, FibreUpgradeOfferEligibility boolean, FibreRegradeOfferEligibility boolean, MultiscreenOfferEligibility boolean, LastModifiedDate datetime, PRIMARY KEY(TrackingID));
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
  "MoviesUpliftScore": 0.1,
  "SportsUpliftScore": 0.2,
  "TopTierUpliftScore": 0.3,
  "SkyGoExtraUpliftScore": 0.4,
  "FamilyUpliftScore": 0.5,
  "BroadbandUpliftScore": 0.6,
  "FibreUpgradeUpliftScore": 0.7,
  "FibreRegradeUpliftScore": 0.8,
  "MultiscreenUpliftScore": 0.9,
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
  "MultiscreenOfferEligibility": 0
}
```
Check the cloud function logs to see if the record was inserted into the database. 

Run the following from the Cloud SQL shell: -
```sql
select * from CustomerAttributes;
```

## Clear Down
You will be continue to be charged for Cloud SQL if you leave it running, remove the database instance by running the following from Cloud Shell: -
```
gcloud sql instances delete decisioninginstance
gcloud beta functions delete PubSubToCloudSQLPrototype --region europe-west1
gcloud pubsub topics delete decisioningTopic
```

## Troubleshooting
If there are errors deploying from your local machine then make sure the gcloud components are up to date.
When creating the database instance if there is an error regarding it taking longer than expected then check in the GCP UI that it has been set up.
Use the Stackdriver logs to track down errors.



