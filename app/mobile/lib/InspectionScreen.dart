import 'package:flutter/material.dart';

import 'package:image_picker/image_picker.dart';

import 'package:geolocator/geolocator.dart';

import 'package:google_mlkit_text_recognition/google_mlkit_text_recognition.dart';

class InspectionScreen extends StatefulWidget {

  @override
  State<InspectionScreen> createState() =>
      _InspectionScreenState();
}

class _InspectionScreenState
    extends State<InspectionScreen> {

  TextEditingController container =
      TextEditingController();

  String gpsLocation = '';

  String ocrText = '';

  final ImagePicker picker =
      ImagePicker();

  XFile? image;

  final textRecognizer =
      TextRecognizer();

  Future pickImage() async {

    image = await picker.pickImage(
      source: ImageSource.camera,
    );

    setState(() {});
  }

  Future getLocation() async {

    Position position =
        await Geolocator
            .getCurrentPosition();

    setState(() {

      gpsLocation =
          '${position.latitude}, ${position.longitude}';
    });
  }

  @override
  void initState() {

    super.initState();

    getLocation();
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      appBar: AppBar(
        title: Text('Inspection'),
      ),

      body: Padding(

        padding: EdgeInsets.all(20),

        child: ListView(

          children: [

            TextField(

              controller: container,

              decoration: InputDecoration(
                labelText:
                    'Container Number',
                border:
                    OutlineInputBorder(),
              ),
            ),

            SizedBox(height: 20),

            ElevatedButton(

              onPressed: pickImage,

              child: Text('OPEN CAMERA'),
            ),

            SizedBox(height: 20),

            image != null
                ? Image.network(
                    image!.path,
                    height: 200,
                  )
                : Container(),

            SizedBox(height: 20),

            Container(

              padding: EdgeInsets.all(20),

              decoration: BoxDecoration(
                color: Colors.blue.shade100,
                borderRadius:
                    BorderRadius.circular(
                        20),
              ),

              child: Text(
                'GPS:\n$gpsLocation',
              ),
            ),

            SizedBox(height: 20),

            Container(

              padding: EdgeInsets.all(20),

              decoration: BoxDecoration(
                color: Colors.orange.shade100,
                borderRadius:
                    BorderRadius.circular(
                        20),
              ),

              child: Text(
                'OCR:\n$ocrText',
              ),
            ),

            SizedBox(height: 30),

            ElevatedButton(

              onPressed: () {

                ScaffoldMessenger.of(
                        context)
                    .showSnackBar(

                  SnackBar(
                    content: Text(
                        'Inspection Saved'),
                  ),
                );
              },

              child:
                  Text('SAVE INSPECTION'),
            ),
          ],
        ),
      ),
    );
  }
}