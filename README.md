# Hello World

In this site, I do my own things.

```console
ubuntu@strixgoldhorn:~$ whoami

noob at programming
```

<br/><br/><br/>

## ToC

- [Hello World](#hello-world)
  - [ToC](#toc)
  - [RBS 70 Simulator](#rbs-70-simulator)
    - [Background](#background)
    - [Features of simulator](#features-of-simulator)
  - [Fake Virus Site](#fake-virus-site)
  - [pOOP Assistant - python OOP Assistant](#poop-assistant---python-oop-assistant)
  - [FoV-Subject Preview](#fov-subject-preview)
  - [F1-Data](#f1-data)

<br/><br/><br/>

## RBS 70 Simulator

RBS 70 Simulator written with ThreeJS. First version created in March 2022.

1 week of coding + (re)learning Javascript resulted in this simplistic simulator

Models created in Blender, skybox and favicon with FireAlpaca.

**[click here for stable version of simulator](./VSHORAD%20(EXPORT)/vshoradsim.html)**

**[click here for UNSTABLE version of simulator](./VSHORAD%20(unstable)/vshoradsim.html)**

### Background

RBS 70 is a MANPADS for VSHORAD / MSHORAD.

It is produced by Saab Bofors Dynamics, and is SACLOS using laser beam-riding missiles.

Laser needs to be uncaged, to allow it to be pointed at where the user points it to. Missile follows the laser beam.

Compared with other weapon systems that rely on radar or infrared guidance, this SACLOS system is invulnerable to countermeasures such as chaff or flares.

### Features of simulator

Contains basic functions, such as:

- Caging / Uncaging the seeker
  - Missile stops after being uncaged mid-flight
- Tracks whether missile is Loaded / In-Flight / Empty
- Displays missile flight path after target is hit
- Displays C130 (target) flight path
- Range and altitude limit for missile based on open source info
- Randomisable landscape
- Basic support for mobile devices

<br/><br/><br/>

## Fake Virus Site

[visit this cool site where I create a fake virus popup](for_the_lolz/fakeviruspopup.html)

This was to test out functionalities such as TTS. Purely for educational purposes only.

First (and only version) created in Late 2021.

<br/><br/><br/>

## pOOP Assistant - python OOP Assistant

[This site](pOOP/index.html) helps to generate getter and setter methods for python objects.

Uses jQuery to actively read user input and update output.

First (and probably only version) created in Early 2022.

<br/><br/><br/>

## FoV-Subject Preview

[This is a tool](FoV-Subject%20Preview/index.html) to allow photographers to preview the ratio of subject to fore/background, based on their input for the focal length of the lens, distance to the subject, and dimensions of subject.

Features:
- Adjustable sensor width and height
- Adjustable focal length
- Adjustable distance to target, and target size
- Pre-calculated target sizes for certain objects

Uses jQuery to actively read user input and update element's HTML and CSS.

First version created in June 2022.

## F1-Data

[This site](f1-data/index.html) provides users with a timetable of upcoming race, and a page for comparing laptimes of drivers.

Features:
- Timetable for upcoming races, color coded to show events that have been completed
- Table to display current standings of driver championship
- Page to compare lap times of 2 drivers throughout a chosen race. Is able to compare:
  - Raw timing
  - Timedelta with respect to first driver

Uses the [Ergast Developer Api](http://ergast.com/mrd/) for data of upcoming races, current driverstandings, and laptimes of drivers.

First version created in July 2022.