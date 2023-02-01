# Dot Density Data - EC2 instance instructions. 

## Preperation 
### Setting up keyless login
1. Download your relevant `.pem` encryption file
2. Move this to the folder you will be sshing into the instance from. 
3. Set the permissions to owner read only with `chmod 4000 <your file>.pem`
4. Run the ssh command. (e.g. ssh -i "./path_to_your_key.pem" ubuntu@ec2-xx-xxx-xx-x.eu-west-2.compute.amazonaws.com)
### Transferring the Data to instance 

1. On your machine, navigate to the *parent* of your data folder. 
- the current format is an `Inputs` folder containing the OA `geom` shapefiles and a `data` folder containing the 'TSxxx.csv' files. 
2. `scp -i "~/<file>.pem" -r ./Inputs/ ubuntu@ec2-<xx-xxx-xx>.eu-west-2.compute.amazonaws.com:~/`

### Cloning the repository (this step can be done whilst the scp works. )
1. Log into the instance: `ssh -i "./path_to_your_key.pem" ubuntu@ec2-xx-xxx-xx-x.eu-west-2.compute.amazonaws.com`
2. `cd ; git clone https://github.com/ONSvisual/DotDensityPrototype.git`
3. Navigate to the processing repo:
`cd DotDensityPrototype/process`


### Installing dependancies
sudo apt install make







## Visualising the prototype

Can be done using netlify or locally. 

- Remember to run `npm run dev` or `npm build` as required. 