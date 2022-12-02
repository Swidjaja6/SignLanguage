# CMPE195 Sign Language Project

This project has two main folders in the src folder which are the frontend and the mlcode. The mlcode has the Convolutional Neural Network on which it was trained in Python using data that we recorded of American Sign Language signs. These are stored in Numpy arrays and we saved the model as an h5 file with the weights.

The frontend folder has all of the frontend elements written using Angular. There is only one page which eliminates the need for a backend to move pages. This page translates the signs into English and displays the translations on the monitor. The model weights are loaded from the h5 file after we reimplemented the basic set-up of the model in Javascript. Setup on how to start the frontend is also in the frontend folder.

Credits:
Samuel Low
Rohan Ohlan
Krishna Pajiyar
Sean Widjaja