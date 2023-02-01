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
1. Install gnu make: `sudo apt install make --yes`
2. Run the installer: `make -j`
3. If a pink screen appears hit ENTER only 


### Understanding the terminal multiplexer
In the case of unstable computation, a break in the SSH connection can result in the termination of our computation. For this reason we utilise GNU screen. 

1. To attach to a compte session we naviage to the processing repo:
`cd DotDensityPrototype/process` 
2. We then type `make compute`

This attaches to the 'compute' screen. We can view all screen instances with `screen -ls`.


### Starting processing of a single file
1. To attach to a compte session we naviage to the processing repo:
`cd DotDensityPrototype/process` 
2. We then type `make compute`
3. Type `make single`. This exececutes the processing python script. 
4. Now we locate the dataset we are interested in, enter its number and press carriage return (ENTER).


### Viewing status after our session has accidentally detached. 
We do not have to keep our terminal open throughout the computation. Instead we can have a cup of tea, and go back to see how it is doing - this is useful when processing _all_ the datasets below. Similarly if our connection drops we can re-attach to the session.

To do this: 
1. Log into the instance: `ssh -i "./path_to_your_key.pem" ubuntu@ec2-xx-xxx-xx-x.eu-west-2.compute.amazonaws.com`
2. To attach to a compte session we naviage to the processing repo:
`cd DotDensityPrototype/process` 
3. We then type `make compute`

Now we should be attached to the same screen we were previously. 






### Viewing system load and resources
To view the system resources: 
1. Open a new terminal tab
2. Log into the instance: `ssh -i "./path_to_your_key.pem" ubuntu@ec2-xx-xxx-xx-x.eu-west-2.compute.amazonaws.com`
3. type `htop`

## Visualising the prototype

Can be done using netlify or locally. 

- Remember to run `npm run dev` or `npm build` as required. 